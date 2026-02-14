"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { validateImageFile } from "@/utils/fileHelpers";

export interface PresetModel {
  id: string;
  file: File;
  previewUrl: string;
}

interface PresetModelsUploadProps {
  models: PresetModel[];
  onModelsChange: (models: PresetModel[]) => void;
  disabled?: boolean;
}

const MAX_MODELS = 20;

export default function PresetModelsUpload({
  models,
  onModelsChange,
  disabled = false,
}: PresetModelsUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      const remaining = MAX_MODELS - models.length;
      if (remaining <= 0) {
        setError(`Maximum ${MAX_MODELS} model images allowed.`);
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remaining);
      if (acceptedFiles.length > remaining) {
        setError(
          `Only ${remaining} more model image${remaining > 1 ? "s" : ""} can be added. Extra files were ignored.`
        );
      }

      for (const file of filesToAdd) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      const newModels: PresetModel[] = filesToAdd.map((file, i) => ({
        id: `model-${Date.now()}-${i}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      onModelsChange([...models, ...newModels]);
    },
    [models, onModelsChange]
  );

  const handleRemove = (id: string) => {
    const model = models.find((m) => m.id === id);
    if (model) URL.revokeObjectURL(model.previewUrl);
    onModelsChange(models.filter((m) => m.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    multiple: true,
    disabled,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Reference Model Images
          </h2>
          <p className="text-sm text-gray-500">
            Upload model photos to cycle through when processing garments.
            <span className="ml-1 text-gray-400">
              ({models.length}/{MAX_MODELS})
            </span>
          </p>
        </div>
        {models.length > 0 && (
          <button
            onClick={() => {
              models.forEach((m) => URL.revokeObjectURL(m.previewUrl));
              onModelsChange([]);
            }}
            disabled={disabled}
            className="text-xs font-medium text-red-500 hover:text-red-600 disabled:text-gray-300"
          >
            Remove All
          </button>
        )}
      </div>

      {/* Upload zone */}
      {models.length < MAX_MODELS && (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
            ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50"
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-3 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">
                Add model images
              </span>{" "}
              — click or drag &amp; drop (JPEG/PNG, up to 10 MB each)
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Model grid */}
      {models.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {models.map((model, index) => (
            <div key={model.id} className="group relative">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={model.previewUrl}
                  alt={`Model ${index + 1}`}
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
              <span className="mt-1 block text-center text-xs font-medium text-gray-500">
                Model {index + 1}
              </span>
              {!disabled && (
                <button
                  onClick={() => handleRemove(model.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
