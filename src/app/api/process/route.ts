import { NextRequest, NextResponse } from "next/server";
import replicate from "@/lib/replicate";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateImage(file: File, label: string): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${label}: Invalid file type. Please upload a JPEG or PNG image.`;
  }
  if (file.size > MAX_SIZE) {
    return `${label}: File is too large. Maximum size is 10MB.`;
  }
  return null;
}

async function uploadToReplicate(file: File): Promise<string> {
  const resp = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "Content-Type": file.type,
    },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!resp.ok) {
    throw new Error(`Failed to upload ${file.name}: ${resp.statusText}`);
  }
  const data = await resp.json();
  return data.urls.get;
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const modelImage = formData.get("modelImage") as File | null;
    const garmentImage = formData.get("garmentImage") as File | null;

    if (!modelImage || !garmentImage) {
      return NextResponse.json(
        { error: "Both model image and garment image are required." },
        { status: 400 }
      );
    }

    const modelError = validateImage(modelImage, "Model image");
    if (modelError) {
      return NextResponse.json({ error: modelError }, { status: 400 });
    }

    const garmentError = validateImage(garmentImage, "Garment image");
    if (garmentError) {
      return NextResponse.json({ error: garmentError }, { status: 400 });
    }

    // Upload images to Replicate's file hosting (much faster than base64)
    const [modelUrl, garmentUrl] = await Promise.all([
      uploadToReplicate(modelImage),
      uploadToReplicate(garmentImage),
    ]);

    const output = await replicate.run("google/nano-banana-pro", {
      input: {
        prompt:
          "Virtual try-on: Replace the shirt/top the person is wearing in the first image " +
          "with the garment shown in the second image. " +
          "Keep the person's face, hair, body pose, skin tone, and proportions exactly the same. " +
          "Preserve the original background, scene lighting, shadows, and color temperature. " +
          "The new garment should fit naturally on the person's body with realistic fabric texture, " +
          "drape, wrinkles, and stitching details matching the flat-lay garment provided. " +
          "Produce a photorealistic, catalog-quality image with sharp focus and seamless blending.",
        image_input: [modelUrl, garmentUrl],
        aspect_ratio: "match_input_image",
        resolution: "2K",
        output_format: "jpg",
        safety_filter_level: "block_only_high",
      },
    });

    // Replicate FileOutput: use String() to extract the URL
    const imageUrl = String(output);

    if (!imageUrl || imageUrl === "[object Object]") {
      throw new Error("Could not extract image URL from Replicate output.");
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Replicate API error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
