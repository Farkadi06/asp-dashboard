"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import {
  ApiKeyEmptyState,
  ApiKeyList,
  CreateKeyDialog,
} from "@/components/dashboard/api-keys";
import {
  ApiKey,
  generateKeyId,
  maskKey,
} from "@/lib/utils/api-keys";

const STORAGE_KEY = "asp_api_keys";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setKeys(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored API keys", e);
        }
      }
    }
  }, []);

  // Save keys to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("apiKeysChanged", { detail: keys }));
    }
  }, [keys]);

  const handleCreateKey = (rawKey: string) => {
    const newKey: ApiKey = {
      id: generateKeyId(),
      raw: rawKey,
      masked: maskKey(rawKey),
      createdAt: new Date().toISOString(),
    };
    setKeys([...keys, newKey]);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.filter((key) => key.id !== id));
  };

  return (
    <div className="px-12 py-8">
      <PageHeader
        title="API Keys"
        description="Manage your API keys for authentication"
      />

      {keys.length === 0 ? (
        <ApiKeyEmptyState onCreateKey={() => setIsDialogOpen(true)} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {keys.length} {keys.length === 1 ? "key" : "keys"}
            </p>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create new secret key
            </button>
          </div>
          <ApiKeyList keys={keys} onRevoke={handleRevoke} />
        </div>
      )}

      <CreateKeyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onKeyCreated={handleCreateKey}
        redirectToAccess={true}
      />
    </div>
  );
}
