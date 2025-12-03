"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EndpointList } from "@/components/api-explorer/EndpointList";
import { EndpointRunner } from "@/components/api-explorer/EndpointRunner";
import { ResponseViewer } from "@/components/api-explorer/ResponseViewer";
import { ENDPOINTS } from "@/lib/config/api-endpoints";
import { ApiEndpoint } from "@/lib/config/api-endpoints";

export default function ApiExplorerPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(
    null
  );
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    data: any;
    time: number;
    error?: string;
  } | null>(null);

  return (
      <div className="flex h-full w-full overflow-hidden px-12 ">
        {/* API Explorer Left Sidebar - EndpointList */}
        <aside className="w-[260px] shrink-0 border-r border-gray-200 bg-white h-full overflow-hidden flex flex-col z-10">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">API Explorer</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <EndpointList
              endpoints={ENDPOINTS}
              selectedEndpoint={selectedEndpoint}
              onSelect={(endpoint) => {
                setSelectedEndpoint(endpoint);
                setResponse(null); // Clear previous response
              }}
            />
          </div>
        </aside>

        {/* Main Content - Runner Panel */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <EndpointRunner
            endpoint={selectedEndpoint}
            onResponse={setResponse}
          />
          <ResponseViewer response={response} />
        </div>
      </div>
  );
}

