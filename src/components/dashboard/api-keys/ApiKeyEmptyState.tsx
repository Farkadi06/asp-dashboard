"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyEmptyStateProps {
  onCreateKey: () => void;
}

export function ApiKeyEmptyState({ onCreateKey }: ApiKeyEmptyStateProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4">
          <Lock className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Create an API key to access the ASP APIs
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          Generate a secret key to authenticate your requests to the ASP API.
        </p>
        <Button
          onClick={onCreateKey}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create new secret key
        </Button>
      </div>
    </div>
  );
}

