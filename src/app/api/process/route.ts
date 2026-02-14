import { NextRequest, NextResponse } from "next/server";
import replicate from "@/lib/replicate";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { modelUrl, garmentUrl } = await request.json();

    if (!modelUrl || !garmentUrl) {
      return NextResponse.json(
        { error: "Both model URL and garment URL are required." },
        { status: 400 }
      );
    }

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

    const imageUrl = String(output);

    if (!imageUrl || imageUrl === "[object Object]") {
      throw new Error("Could not extract image URL from Replicate output.");
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Replicate API error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
