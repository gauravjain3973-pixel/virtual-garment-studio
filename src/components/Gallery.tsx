"use client";

import { useState } from "react";

export interface GalleryItem {
  id: string;
  resultUrl: string;
  filename: string;
  createdAt: number;
}

interface GalleryProps {
  items: GalleryItem[];
  onDelete: (ids: string[]) => void;
}

function triggerDownload(blobUrl: string, name: string) {
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24 && date.getDate() === now.getDate()) return `Today at ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate()) return `Yesterday at ${time}`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ` at ${time}`;
}

export default function Gallery({ items, onDelete }: GalleryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  const hasItems = items.length > 0;
  const allSelected = hasItems && selected.size === items.length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const handleDeleteSelected = () => {
    onDelete(Array.from(selected));
    setSelected(new Set());
  };

  const handleDownloadSelected = async () => {
    setDownloading(true);
    const toDownload = items.filter((i) => selected.has(i.id));
    for (const item of toDownload) {
      try {
        const response = await fetch(item.resultUrl);
        const blob = await response.blob();
        triggerDownload(URL.createObjectURL(blob), item.filename);
        // Small delay between downloads so browser doesn't block them
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        console.error(`Failed to download ${item.filename}`);
      }
    }
    setDownloading(false);
  };

  const handleDownloadSingle = async (item: GalleryItem) => {
    const response = await fetch(item.resultUrl);
    const blob = await response.blob();
    triggerDownload(URL.createObjectURL(blob), item.filename);
  };

  return (
    <div className="mt-16">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Gallery
          {hasItems && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({items.length} image{items.length !== 1 ? "s" : ""})
            </span>
          )}
        </h2>

        {hasItems && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAll}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>

            {selected.size > 0 && (
              <>
                <button
                  onClick={handleDownloadSelected}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {downloading
                    ? "Downloading..."
                    : `Download (${selected.size})`}
                </button>

                <button
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete ({selected.size})
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {!hasItems ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <p className="mt-3 text-sm text-gray-400">
            Generated images will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-xl border-2 transition-colors ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(item.id)}
                  className={`absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-white/70 bg-white/50 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Image */}
                <img
                  src={item.resultUrl}
                  alt={item.filename}
                  className="aspect-[3/4] w-full object-cover"
                />

                {/* Filename + timestamp below image */}
                <div className="border-t border-gray-100 bg-white px-3 py-2">
                  <p className="truncate text-xs font-medium text-gray-700">
                    {item.filename}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {formatTimestamp(item.createdAt)}
                  </p>
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end bg-gradient-to-t from-black/50 to-transparent px-3 pb-10 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="shrink-0 rounded-md bg-white/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
