"use client";

import { useState, useRef, FormEvent } from "react";
import PresetModelsUpload, {
  PresetModel,
} from "@/components/PresetModelsUpload";
import BatchUploadGrid, {
  GarmentEntry,
} from "@/components/BatchUploadGrid";
import Loader from "@/components/Loader";
import ResultViewer from "@/components/ResultViewer";
import Gallery, { GalleryItem } from "@/components/Gallery";

function parseStyleCode(code: string) {
  const upper = code.toUpperCase();
  return { style: upper.slice(0, -1), color: upper.slice(-1) };
}

export default function Home() {
  // Preset model images
  const [presetModels, setPresetModels] = useState<PresetModel[]>([]);

  // Garment entries with individual style codes
  const [garmentEntries, setGarmentEntries] = useState<GarmentEntry[]>([]);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [latestResult, setLatestResult] = useState<{
    resultUrl: string;
    modelPreviewUrl: string;
    styleCode: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Track which model to use next (persists across batches)
  const nextModelRef = useRef(0);

  const allStyleCodesValid = garmentEntries.length > 0 && garmentEntries.every(
    (entry) => /^[a-zA-Z0-9]{2,20}$/.test(entry.styleCode)
  );
  const canSubmit =
    presetModels.length > 0 &&
    garmentEntries.length > 0 &&
    allStyleCodesValid &&
    !processing;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setProcessing(true);
    setError(null);
    setLatestResult(null);
    setCurrentIndex(0);
    setTotalFiles(garmentEntries.length);

    for (let i = 0; i < garmentEntries.length; i++) {
      const entry = garmentEntries[i];
      const { style, color } = parseStyleCode(entry.styleCode);

      // Cycle through preset models
      const modelIdx = nextModelRef.current % presetModels.length;
      nextModelRef.current += 1;

      setCurrentIndex(i + 1);
      setCurrentModelIndex(modelIdx + 1);

      try {
        const formData = new FormData();
        formData.append("modelImage", presetModels[modelIdx].file);
        formData.append("garmentImage", entry.file);

        const response = await fetch("/api/process", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong.");
        }

        const filename = `${style}-${color}-${i + 1}.jpg`;

        // Add to gallery
        setGallery((prev) => [
          {
            id: `${Date.now()}-${i}`,
            resultUrl: data.imageUrl,
            filename,
            createdAt: Date.now(),
          },
          ...prev,
        ]);

        // Show latest result in the compare viewer
        setLatestResult({
          resultUrl: data.imageUrl,
          modelPreviewUrl: presetModels[modelIdx].previewUrl,
          styleCode: entry.styleCode,
        });
      } catch (err) {
        setError(
          `File ${i + 1}: ${
            err instanceof Error ? err.message : "An unexpected error occurred."
          }`
        );
      }
    }

    setProcessing(false);
  };

  const handleDeleteGalleryItems = (ids: string[]) => {
    setGallery((prev) => prev.filter((item) => !ids.includes(item.id)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Virtual Garment Replacement Studio
          </h1>
          <p className="mt-3 text-base text-gray-500">
            Upload reference models and up to 10 flat-lay shirts to generate
            realistic virtual try-ons.
          </p>
        </div>

        {/* Preset Models Section */}
        <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <PresetModelsUpload
            models={presetModels}
            onModelsChange={setPresetModels}
            disabled={processing}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Garment Upload with individual style codes */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <BatchUploadGrid
              entries={garmentEntries}
              onEntriesChange={setGarmentEntries}
              disabled={processing}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {processing
                ? `Processing ${currentIndex}/${totalFiles}...`
                : `Generate Virtual Try-On${
                    garmentEntries.length > 1
                      ? ` (${garmentEntries.length} files)`
                      : ""
                  }`}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Progress bar */}
        {processing && (
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Processing garment {currentIndex} of {totalFiles}
              </span>
              <span className="font-medium text-indigo-600">
                Using Model {currentModelIndex} of {presetModels.length}
              </span>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-500">
                {Math.round((currentIndex / totalFiles) * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{
                  width: `${(currentIndex / totalFiles) * 100}%`,
                }}
              />
            </div>
            <Loader />
          </div>
        )}

        {/* Latest Result */}
        {latestResult && !processing && (
          <div className="mt-16">
            <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
              Latest Result
            </h2>
            <ResultViewer
              originalUrl={latestResult.modelPreviewUrl}
              resultUrl={latestResult.resultUrl}
              styleCode={latestResult.styleCode}
            />
          </div>
        )}

        {/* Gallery */}
        <Gallery items={gallery} onDelete={handleDeleteGalleryItems} />
      </div>
    </div>
  );
}
