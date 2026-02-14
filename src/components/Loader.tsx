"use client";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
      </div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">
        Processing your image&hellip;
      </p>
    </div>
  );
}
