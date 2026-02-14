"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { validateImageFile } from "@/utils/fileHelpers";

export interface GarmentEntry {
  id: string;
  file: File;
  previewUrl: string;
  styleCode: string;
}

interface BatchUploadGridProps {
  entries: GarmentEntry[];
  onEntriesChange: (entries: GarmentEntry[]) => void;
  disabled?: boolean;
}

const MAX_FILES = 10;

export default function BatchUploadGrid({
  entries,
  onEntriesChange,
  disabled = false,
}: BatchUploadGridProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      const remaining = MAX_FILES - entries.length;
      if (remaining <= 0) {
        setError(`Maximum ${MAX_FILES} garment images allowed.`);
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remaining);
      if (acceptedFiles.length > remaining) {
        setError(
          `Only ${remaining} more file${remaining > 1 ? "s" : ""} can be added. Extra files were ignored.`
        );
      }

      for (const file of filesToAdd) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      const newEntries: GarmentEntry[] = filesToAdd.map((file, i) => ({
        id: `garment-${Date.now()}-${i}`,
        file,
        previewUrl: URL.createObjectURL(file),
        styleCode: "",
      }));

      onEntriesChange([...entries, ...newEntries]);
    },
    [entries, onEntriesChange]
  );

  const handleRemove = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) URL.revokeObjectURL(entry.previewUrl);
    onEntriesChange(entries.filter((e) => e.id !== id));
  };

  const handleStyleCodeChange = (id: string, value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
    onEntriesChange(
      entries.map((e) => (e.id === id ? { ...e, styleCode: cleaned } : e))
    );
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
            Flat-Lay Garments
          </h2>
          <p className="text-sm text-gray-500">
            Upload garment images and set a style code for each.
            <span className="ml-1 text-gray-400">
              ({entries.length}/{MAX_FILES})
            </span>
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => {
              entries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
              onEntriesChange([]);
            }}
            disabled={disabled}
            className="text-xs font-medium text-red-500 hover:text-red-600 disabled:text-gray-300"
          >
            Remove All
          </button>
        )}
      </div>

      {/* Upload zone */}
      {entries.length < MAX_FILES && (
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
                Add garment images
              </span>{" "}
              — click or drag &amp; drop (JPEG/PNG, up to 10 MB each)
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Garment grid */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {entries.map((entry, index) => {
            const isValid =
              /^[a-zA-Z0-9]{2,20}$/.test(entry.styleCode);
            return (
              <div key={entry.id} className="group relative space-y-2">
                {/* Image */}
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={entry.previewUrl}
                    alt={`Garment ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    #{index + 1}
                  </span>
                  {!disabled && (
                    <button
                      onClick={() => handleRemove(entry.id)}
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

                {/* Style code input */}
                <input
                  type="text"
                  maxLength={20}
                  placeholder="e.g. sj123A"
                  value={entry.styleCode}
                  disabled={disabled}
                  onChange={(e) =>
                    handleStyleCodeChange(entry.id, e.target.value)
                  }
                  className={`block w-full rounded-md border px-2.5 py-1.5 text-xs shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400
                    ${
                      entry.styleCode.length > 0 && !isValid
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }
                  `}
                />
                {entry.styleCode.length > 0 && isValid && (
                  <p className="truncate text-[10px] text-gray-400">
                    →{" "}
                    {entry.styleCode.slice(0, -1).toUpperCase()}-
                    {entry.styleCode.slice(-1).toUpperCase()}-1.jpg
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
