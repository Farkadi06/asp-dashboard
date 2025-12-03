"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useBanks } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface InstitutionBrowserProps {
  selectedBank: string | null;
  onSelect: (bankId: string) => void;
}

export function InstitutionBrowser({
  selectedBank,
  onSelect,
}: InstitutionBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: banks = [], isLoading, error } = useBanks();

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) {
      return banks;
    }
    const query = searchQuery.toLowerCase();
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(query) ||
        bank.slug.toLowerCase().includes(query)
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
          <p className="text-sm text-red-800">
            Failed to load banks. Please check your API key.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanks.map((bank) => {
              const isSelected = selectedBank === bank.id;
              return (
                <button
                  key={bank.id}
                  onClick={() => onSelect(bank.id)}
                  className={cn(
                    "border p-4 flex items-center gap-3 cursor-pointer transition-colors text-left",
                    "bg-white",
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {bank.iconUrl ? (
                    <img
                      src={bank.iconUrl}
                      alt={bank.name}
                      className="w-7 h-7 object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">
                        {bank.name.slice(0, 2).toUpperCase()}
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

