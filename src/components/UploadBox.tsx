"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { validateImageFile } from "@/utils/fileHelpers";

interface UploadBoxProps {
  label: string;
  multiple?: boolean;
  maxFiles?: number;
  onFileSelect: (files: File[]) => void;
}

export default function UploadBox({
  label,
  multiple = false,
  maxFiles = 1,
  onFileSelect,
}: UploadBoxProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length === 0) return;

      const validFiles: File[] = [];
      for (const file of acceptedFiles) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed.`);
        return;
      }

      setPreviews(validFiles.map((f) => URL.createObjectURL(f)));
      onFileSelect(validFiles);
    },
    [onFileSelect, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    maxFiles: multiple ? maxFiles : 1,
    multiple,
  });

  const hasFiles = previews.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">
        {label}
        {multiple && (
          <span className="ml-1 font-normal text-gray-400">
            (up to {maxFiles})
          </span>
        )}
      </span>

      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer
          ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50"
          }
          ${hasFiles ? "min-h-[16rem]" : "h-52"}
        `}
      >
        <input {...getInputProps()} />

        {hasFiles ? (
          <div className="flex w-full flex-wrap items-center justify-center gap-3">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${label} preview ${i + 1}`}
                className="h-36 w-auto rounded-lg object-contain"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">
                Click to upload
              </span>{" "}
              or drag &amp; drop
            </p>
            <p className="text-xs text-gray-400">
              JPEG or PNG, up to 10 MB
              {multiple && ` · Max ${maxFiles} files`}
            </p>
          </div>
        )}

        {hasFiles && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <p className="text-sm font-medium text-white">
              Click or drop to replace
            </p>
          </div>
        )}
      </div>

      {hasFiles && (
        <p className="text-xs text-gray-400">
          {previews.length} file{previews.length > 1 ? "s" : ""} selected
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
