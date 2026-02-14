"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

interface ResultViewerProps {
  originalUrl: string;
  resultUrl: string;
  styleCode: string;
}

function parseStyleCode(code: string) {
  const upper = code.toUpperCase();
  const style = upper.slice(0, -1);
  const color = upper.slice(-1);
  return { style, color };
}

export default function ResultViewer({
  originalUrl,
  resultUrl,
  styleCode,
}: ResultViewerProps) {
  const { style, color } = parseStyleCode(styleCode);
  const filename = `${style}-${color}-1.jpg`;

  const handleDownload = async () => {
    const response = await fetch(resultUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage src={originalUrl} alt="Original model" />
          }
          itemTwo={
            <ReactCompareSliderImage src={resultUrl} alt="Generated result" />
          }
          className="h-[32rem]"
        />
      </div>

      <div className="flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" />
          Original
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
          Generated
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800"
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
        Download {filename}
      </button>
    </div>
  );
}
