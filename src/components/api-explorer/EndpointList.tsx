"use client";

import { cn } from "@/lib/utils";
import { ApiEndpoint } from "@/lib/config/api-endpoints";

interface EndpointListProps {
  endpoints: { group: string; items: ApiEndpoint[] }[];
  selectedEndpoint: ApiEndpoint | null;
  onSelect: (endpoint: ApiEndpoint) => void;
}

export function EndpointList({
  endpoints,
  selectedEndpoint,
  onSelect,
}: EndpointListProps) {
  const isSelected = (endpoint: ApiEndpoint) => {
    return (
      selectedEndpoint?.method === endpoint.method &&
      selectedEndpoint?.path === endpoint.path
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      {endpoints.map((group) => (
        <div key={group.group} className="mb-6">
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {group.group}
          </h3>
          <div className="space-y-1">
            {group.items.map((endpoint, index) => {
              const selected = isSelected(endpoint);
              return (
                <button
                  key={`${endpoint.method}-${endpoint.path}-${index}`}
                  onClick={() => onSelect(endpoint)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm transition-colors",
                    "border-l-4",
                    selected
                      ? "bg-blue-50 border-blue-600 text-blue-900"
                      : "border-transparent hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-semibold px-1.5 py-0.5",
                        endpoint.method === "GET"
                          ? "bg-green-100 text-green-700"
                          : endpoint.method === "POST"
                          ? "bg-blue-100 text-blue-700"
                          : endpoint.method === "PUT"
                          ? "bg-yellow-100 text-yellow-700"
                          : endpoint.method === "DELETE"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-xs truncate">
                      {endpoint.path}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

