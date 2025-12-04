"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import {
  getApiKeyMetadata,
  regenerateApiKey,
  type PublicApiKeyMetadata,
  type RegeneratedApiKeyResponse,
} from "@/lib/api/public-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ApiKeyAccessPage() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<PublicApiKeyMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [regeneratedKey, setRegeneratedKey] = useState<RegeneratedApiKeyResponse | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadMetadata();
  }, []);

  async function loadMetadata() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getApiKeyMetadata();
      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load API key metadata"));
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!confirm("Are you sure you want to regenerate your API key? The current key will be invalidated immediately.")) {
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);
      const result = await regenerateApiKey();
      setRegeneratedKey(result);
      setIsKeyModalOpen(true);
      await loadMetadata();
      toast.success("API key regenerated successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to regenerate API key");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleCopyPrefix() {
    if (metadata?.prefix) {
      navigator.clipboard.writeText(metadata.prefix);
      setCopied(true);
      toast.success("Prefix copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCopyFullKey() {
    if (regeneratedKey?.fullKey) {
      navigator.clipboard.writeText(regeneratedKey.fullKey);
      toast.success("Full API key copied to clipboard");
    }
  }

  function handleKeyModalClose() {
    setIsKeyModalOpen(false);
    setRegeneratedKey(null);
  }

  // Mask prefix (show first 10 chars + stars)
  function maskPrefix(prefix: string): string {
    if (prefix.length <= 10) return prefix;
    return prefix.slice(0, 10) + "*****";
  }

  if (isLoading) {
    return (
      <div className="px-12 py-8">
        <PageHeader title="API Key Access" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading API key metadata...</span>
        </div>
      </div>
    );
  }

  if (error && !metadata) {
    return (
      <div className="px-12 py-8">
        <PageHeader title="API Key Access" />
        <div className="bg-red-50 border border-red-200 p-6 mt-6">
          <p className="text-sm text-red-800">{error.message}</p>
          <Button onClick={loadMetadata} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.asp-platform.com/v1";
  const prefix = metadata?.prefix || "asp_live_sk_xxxxx";

  return (
    <div className="px-12 py-8">
      <PageHeader
        title="API Key Access"
        description="Manage your API key and view code examples"
      />

      <div className="mt-6 space-y-6">
        {/* API Key Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">API Key Prefix</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 text-sm font-mono">
                    {metadata ? maskPrefix(metadata.prefix) : "—"}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrefix}
                    disabled={!metadata}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-sm font-medium">
                  {metadata?.createdAt
                    ? new Date(metadata.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Last Used</p>
                <p className="text-sm font-medium">
                  {metadata?.lastUsed
                    ? new Date(metadata.lastUsed).toLocaleString()
                    : "Not yet used"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Regenerate Key"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notes */}
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Security Notes</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Never expose this key to the browser or commit it to version control.</li>
              <li>Store it in backend environment variables only.</li>
              <li>Regenerate immediately if leaked or compromised.</li>
              <li>This key uniquely identifies your tenant and grants full API access.</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Quick Start Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="node">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="go">Go</TabsTrigger>
              </TabsList>

              <TabsContent value="curl" className="mt-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded border border-gray-200 font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X GET "${apiBaseUrl}/ingestions" \\
  -H "X-Api-Key: ${prefix}..."`}</pre>
                </div>
              </TabsContent>

              <TabsContent value="node" className="mt-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded border border-gray-200 font-mono text-sm overflow-x-auto">
                  <pre>{`const res = await fetch("${apiBaseUrl}/ingestions", {
  headers: {
    "X-Api-Key": "${prefix}..."
  }
});

const data = await res.json();`}</pre>
                </div>
              </TabsContent>

              <TabsContent value="python" className="mt-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded border border-gray-200 font-mono text-sm overflow-x-auto">
                  <pre>{`import requests

res = requests.get(
    "${apiBaseUrl}/ingestions",
    headers={"X-Api-Key": "${prefix}..."}
)

data = res.json()`}</pre>
                </div>
              </TabsContent>

              <TabsContent value="go" className="mt-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded border border-gray-200 font-mono text-sm overflow-x-auto">
                  <pre>{`import (
    "net/http"
    "io/ioutil"
)

req, _ := http.NewRequest("GET", "${apiBaseUrl}/ingestions", nil)
req.Header.Set("X-Api-Key", "${prefix}...")

client := &http.Client{}
resp, _ := client.Do(req)
defer resp.Body.Close()

body, _ := ioutil.ReadAll(resp.Body)`}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Regenerated Key Modal */}
      <Dialog open={isKeyModalOpen} onOpenChange={handleKeyModalClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your New API Key</DialogTitle>
            <DialogDescription>
              This is the only time you'll see this key. Copy it now and store it securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="default" className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                You will NOT be able to see this key again. Copy it now.
              </AlertDescription>
            </Alert>
            {regeneratedKey && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Full API Key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 text-sm font-mono break-all">
                    {regeneratedKey.fullKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopyFullKey}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleKeyModalClose}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

