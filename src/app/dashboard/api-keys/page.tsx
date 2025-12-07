"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import {
  ApiKeyEmptyState,
  ApiKeyList,
  CreateKeyDialog,
} from "@/components/dashboard/api-keys";
import {
  useInternalApiKeys,
  useDeleteInternalApiKey,
} from "@/lib/api/internal/hooks";
import { InternalApiKey } from "@/lib/api/internal-client";
import { toast } from "sonner";

export default function ApiKeysPage() {
  const { data: keys = [], isLoading, error } = useInternalApiKeys();
  const deleteMutation = useDeleteInternalApiKey();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const handleCreateKey = async (fullKey: string, keyId: string, prefix: string) => {
    // Store the full key in server-side cache
    try {
      await fetch("/api/internal/store-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: keyId, prefix, apiKey: fullKey }),
      });
    } catch (error) {
      console.error("Failed to store API key in cache:", error);
      // Continue anyway - the key will still work, just won't be cached
    }

    // Store the full key to show in the reveal dialog
    setNewlyCreatedKey(fullKey);
    setIsDialogOpen(true);
  };

  const handleRevoke = async (id: string, prefix: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      
      // Remove from cache
      try {
        await fetch("/api/internal/store-api-key", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, prefix }),
        });
      } catch (error) {
        console.error("Failed to remove API key from cache:", error);
        // Continue anyway
      }
      
      toast.success("API key revoked successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke API key");
    }
  };

  if (isLoading) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="API Keys"
          description="Manage your API keys for authentication"
        />
        <div className="bg-white border border-gray-200 shadow-sm p-12">
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-600">Loading API keys...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="API Keys"
          description="Manage your API keys for authentication"
        />
        <div className="bg-white border border-gray-200 shadow-sm p-12">
          <div className="flex items-center justify-center">
            <p className="text-sm text-red-600">
              {error instanceof Error ? error.message : "Failed to load API keys"}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <ApiKeyList 
            keys={keys} 
            onRevoke={(id, prefix) => handleRevoke(id, prefix)} 
          />
        </div>
      )}

      <CreateKeyDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setNewlyCreatedKey(null);
          }
        }}
        onKeyCreated={handleCreateKey}
        fullKey={newlyCreatedKey}
        redirectToAccess={true}
      />
    </div>
  );
}
