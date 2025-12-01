"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateApiKey } from "@/lib/utils/api-keys";

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: (key: string) => void;
}

export function CreateKeyDialog({
  open,
  onOpenChange,
  onKeyCreated,
}: CreateKeyDialogProps) {
  const [rawKey, setRawKey] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !rawKey) {
      // Generate key when dialog opens
      const newKey = generateApiKey();
      setRawKey(newKey);
      setCopied(false);
    } else if (!isOpen) {
      // Reset when closing
      setRawKey("");
      setCopied(false);
    }
    onOpenChange(isOpen);
  };

  const handleCopy = async () => {
    if (rawKey) {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    if (rawKey) {
      onKeyCreated(rawKey);
      handleOpenChange(false);
    }
  };

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
              {rawKey}
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

