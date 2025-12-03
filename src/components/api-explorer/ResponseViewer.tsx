"use client";

import { cn } from "@/lib/utils";

interface ResponseViewerProps {
  response: {
    status: number;
    statusText: string;
    data: any;
    time: number;
    error?: string;
  } | null;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  if (!response) {
    return null;
  }

  const isError = response.status === 0 || response.status >= 400 || response.error;
  const statusColor = isError
    ? "text-red-600"
    : response.status >= 200 && response.status < 300
    ? "text-green-600"
    : "text-yellow-600";

  let formattedData: string;
  try {
    if (response.error) {
      formattedData = JSON.stringify({ error: response.error }, null, 2);
    } else if (typeof response.data === "string") {
      formattedData = response.data;
    } else {
      formattedData = JSON.stringify(response.data, null, 2);
    }
  } catch (e) {
    formattedData = String(response.data);
  }

  return (
    <div className="mt-6 border border-gray-200 bg-white shadow-sm">
      {/* Status Bar */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={cn("text-sm font-semibold", statusColor)}>
              Status: {response.status || "Error"} {response.statusText}
            </span>
            {response.time > 0 && (
              <span className="text-xs text-gray-500">
                Time: {response.time}ms
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Response Body */}
      <div className="p-4">
        <pre
          className={cn(
            "text-sm font-mono whitespace-pre-wrap overflow-x-auto",
            isError ? "text-red-600" : "text-gray-900"
          )}
        >
          {formattedData}
        </pre>
      </div>
    </div>
  );
}

