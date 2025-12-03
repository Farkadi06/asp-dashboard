"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiEndpoint } from "@/lib/config/api-endpoints";
import { getApiKeys } from "@/lib/utils/api-keys";
import { getAspClient } from "@/lib/api";

interface EndpointRunnerProps {
  endpoint: ApiEndpoint | null;
  onResponse: (response: {
    status: number;
    statusText: string;
    data: any;
    time: number;
    error?: string;
  }) => void;
}

export function EndpointRunner({
  endpoint,
  onResponse,
}: EndpointRunnerProps) {
  const [requestBody, setRequestBody] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load API key from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const keys = getApiKeys();
      // Use the first available key, or null if none
      const firstKey = keys.length > 0 ? keys[0].raw : null;
      setApiKey(firstKey);
    }
  }, []);

  // Reset request body when endpoint changes
  useEffect(() => {
    if (endpoint) {
      setRequestBody(endpoint.sampleBody);
    }
  }, [endpoint]);

  const handleSendRequest = async () => {
    if (!endpoint || !apiKey) {
      onResponse({
        status: 0,
        statusText: "Error",
        data: null,
        time: 0,
        error: "No API key found. Please create an API key first.",
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Use API client for known endpoints, otherwise use direct fetch
      const client = getAspClient(apiKey);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NODE_ENV === "production"
          ? "https://api.asp-platform.com/v1"
          : "http://localhost:8080/v1");
      
      // Build URL - replace {id} placeholder if present
      let url = `${baseUrl}${endpoint.path}`;
      
      // Try to extract id from request body if it's a GET request with {id}
      if (endpoint.path.includes("{id}") && endpoint.method === "GET") {
        try {
          const body = JSON.parse(requestBody);
          if (body.id) {
            url = url.replace("{id}", body.id);
          }
        } catch {
          // If body is not valid JSON or doesn't have id, keep placeholder
        }
      }

      // Prepare headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      };

      // Prepare request options
      const options: RequestInit = {
        method: endpoint.method,
        headers,
      };

      // Add body only for POST, PUT, PATCH
      if (["POST", "PUT", "PATCH"].includes(endpoint.method)) {
        try {
          const parsedBody = JSON.parse(requestBody);
          options.body = JSON.stringify(parsedBody);
        } catch (e) {
          onResponse({
            status: 0,
            statusText: "Error",
            data: null,
            time: Date.now() - startTime,
            error: "Invalid JSON in request body",
          });
          setIsLoading(false);
          return;
        }
      }

      // Send request
      const response = await fetch(url, options);
      const time = Date.now() - startTime;

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      onResponse({
        status: response.status,
        statusText: response.statusText,
        data,
        time,
      });
    } catch (error: any) {
      const time = Date.now() - startTime;
      onResponse({
        status: 0,
        statusText: "Error",
        data: null,
        time,
        error: error.message || "Network error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!endpoint) {
    return (
      <div className="bg-white border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">
          Select an endpoint from the sidebar to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`text-xs font-semibold px-2 py-1 ${
              endpoint.method === "GET"
                ? "bg-green-100 text-green-700"
                : endpoint.method === "POST"
                ? "bg-blue-100 text-blue-700"
                : endpoint.method === "PUT"
                ? "bg-yellow-100 text-yellow-700"
                : endpoint.method === "DELETE"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {endpoint.method}
          </span>
          <h1 className="text-xl font-semibold text-gray-900 font-mono">
            {endpoint.path}
          </h1>
        </div>
        <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
      </div>

      {/* Request Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Request Body
        </label>
        <Textarea
          value={requestBody}
          onChange={(e) => setRequestBody(e.target.value)}
          className="min-h-[180px] font-mono text-sm border-gray-300 focus:border-gray-600 rounded-none"
          placeholder="Enter JSON request body..."
        />
      </div>

      {/* API Key Status */}
      {!apiKey && (
        <div className="bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-sm text-yellow-800">
            No API key found. Please create an API key in the{" "}
            <a
              href="/dashboard/api-keys"
              className="underline font-medium"
            >
              API Keys
            </a>{" "}
            section first.
          </p>
        </div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSendRequest}
        disabled={isLoading || !apiKey}
        className="rounded-none"
      >
        {isLoading ? "Sending..." : "Send Request"}
      </Button>
    </div>
  );
}

