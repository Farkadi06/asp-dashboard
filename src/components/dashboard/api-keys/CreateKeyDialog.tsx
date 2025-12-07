"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateInternalApiKey } from "@/lib/api/internal/hooks";
import { toast } from "sonner";

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: (key: string, keyId: string, prefix: string) => void;
  fullKey?: string | null;
  redirectToAccess?: boolean;
}

export function CreateKeyDialog({
  open,
  onOpenChange,
  onKeyCreated,
  fullKey,
  redirectToAccess = false,
}: CreateKeyDialogProps) {
  const router = useRouter();
  const createMutation = useCreateInternalApiKey();
  const [displayName, setDisplayName] = useState("");
  const [sandbox, setSandbox] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && !fullKey) {
      setDisplayName("");
      setSandbox(false);
      setShowKey(false);
      setCopied(false);
    } else if (open && fullKey) {
      setShowKey(true);
    }
  }, [open, fullKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        displayName: displayName.trim(),
        scopes: ["ingestions:write", "accounts:read"],
        sandbox,
      });

      // Pass the full key, ID, and prefix to parent
      onKeyCreated(result.apiKey, result.id, result.prefix);
      setShowKey(true);
      toast.success("API key created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create API key");
    }
  };

  const handleCopy = async () => {
    if (fullKey) {
      await navigator.clipboard.writeText(fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setDisplayName("");
      setSandbox(false);
      setShowKey(false);
      setCopied(false);
    }
    onOpenChange(isOpen);
  };

  const handleDone = () => {
    if (fullKey) {
      handleOpenChange(false);
      if (redirectToAccess) {
        router.push("/dashboard/api-keys/access");
      }
    }
  };

  // Show key reveal screen if key was created
  if (showKey && fullKey) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px] rounded-none">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              You will NOT be able to see this key again. Copy it now.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Key Display */}
            <div className="bg-gray-50 border border-gray-200 p-4">
              <code className="text-sm font-mono text-gray-900 break-all">
                {fullKey}
              </code>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Make sure to copy your API key now. You won't be able to see it
                again!
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button onClick={handleDone} className="bg-blue-600 hover:bg-blue-700">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show create form
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-none">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to authenticate your requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Production API Key"
              required
            />
          </div>

          {/* Sandbox Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sandbox"
              checked={sandbox}
              onChange={(e) => setSandbox(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="sandbox" className="text-sm font-normal cursor-pointer">
              This is a sandbox key (for testing)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Key"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

