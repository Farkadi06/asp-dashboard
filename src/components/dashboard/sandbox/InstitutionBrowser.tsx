"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { fetchBanks, createBankConnection, type PublicBank } from "@/lib/api/public-client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InstitutionBrowserProps {
  selectedBank: string | null;
  onSelect: (bankId: string) => void;
  onConnectionCreated?: (connectionId: string) => void;
}

export function InstitutionBrowser({
  selectedBank,
  onSelect,
  onConnectionCreated,
}: InstitutionBrowserProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [banks, setBanks] = useState<PublicBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState<string | null>(null);

  // Load banks on mount
  useEffect(() => {
    async function loadBanks() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchBanks();
        setBanks(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load banks"));
      } finally {
        setIsLoading(false);
      }
    }
    loadBanks();
  }, []);

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) {
      return banks;
    }
    const query = searchQuery.toLowerCase();
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(query) ||
        bank.code.toLowerCase().includes(query)
    );
  }, [banks, searchQuery]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Choose your bank
        </h2>
        <Input
          type="text"
          placeholder="Search banks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-none focus-visible:ring-0"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading banks...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800 mb-2">
            Failed to load banks
          </p>
          <p className="text-xs text-red-700">
            {error.message.includes("API key not configured") || 
             error.message.includes("500") ||
             error.message.includes("Missing ASP_API_KEY")
              ? "Please configure ASP_API_KEY in your .env.local file and restart the dev server. See docs/ENV_SETUP.md for details."
              : error.message || "Please check your API key configuration."}
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanks.map((bank) => {
              const isSelected = selectedBank === bank.id;
              const isCreating = isCreatingConnection === bank.id;
              return (
                <button
                  key={bank.id}
                  onClick={async () => {
                    if (isCreating) return;
                    
                    try {
                      setIsCreatingConnection(bank.id);
                      const connection = await createBankConnection(bank.id);
                      onSelect(bank.id);
                      // Notify parent component of connection creation
                      if (onConnectionCreated) {
                        onConnectionCreated(connection.connectionId);
                      }
                      toast.success("Bank connection created successfully");
                      // Navigate to sandbox page (we're already there, but this ensures state is updated)
                      router.refresh();
                    } catch (err) {
                      const errorMessage = err instanceof Error ? err.message : "Failed to create bank connection";
                      toast.error(errorMessage);
                      setError(err instanceof Error ? err : new Error(errorMessage));
                    } finally {
                      setIsCreatingConnection(null);
                    }
                  }}
                  disabled={isCreating}
                  className={cn(
                    "border p-4 flex items-center gap-3 cursor-pointer transition-colors text-left",
                    "bg-white",
                    isCreating && "opacity-50 cursor-not-allowed",
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {isCreating ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : bank.logoUrl ? (
                    <img
                      src={bank.logoUrl}
                      alt={bank.name}
                      className="w-7 h-7 object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">
                        {bank.code.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {bank.name}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredBanks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                No banks found matching your search.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

