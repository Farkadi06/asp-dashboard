"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import {
  IngestionSummary,
  PipelineChecklist,
  MerchantEnrichmentTable,
  TransactionsTable,
} from "@/components/dashboard/ingestions";
import { IngestionDetail } from "@/lib/types/ingestion-detail";
import { fetchIngestion, fetchAccounts, type PublicIngestion, type PublicAccount } from "@/lib/api/public-client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, ArrowRight } from "lucide-react";

export default function IngestionDetailPage() {
  const params = useParams();
  const ingestionId = params.id as string;

  const [ingestion, setIngestion] = useState<IngestionDetail | null>(null);
  const [ingestionData, setIngestionData] = useState<PublicIngestion | null>(null);
  const [accounts, setAccounts] = useState<PublicAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [accountsError, setAccountsError] = useState<Error | null>(null);

  // Load ingestion from API
  useEffect(() => {
    async function loadIngestion() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchIngestion(ingestionId);
        
        // Store full ingestion data for bankConnectionId
        setIngestionData(data);
        
        // Map API response to IngestionDetail format
        const detail: IngestionDetail = {
          id: data.id,
          fileName: data.originalFileName || "unknown.pdf",
          status: data.status.toLowerCase() as "pending" | "processing" | "completed" | "failed",
          createdAt: data.createdAt,
          bankCode: "", // Will need to fetch from bank connection if needed
          pipelineStages: [], // Will need to fetch from separate endpoint if available
          merchantEnrichments: [], // Will need to fetch from separate endpoint if available
          transactions: [], // Will need to fetch from separate endpoint if available
        };
        
        setIngestion(detail);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load ingestion"));
        setIngestion(null);
        setIngestionData(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (ingestionId) {
      loadIngestion();
    }
  }, [ingestionId]);

  // Load accounts filtered by bankConnectionId
  useEffect(() => {
    async function loadAccounts() {
      if (!ingestionData?.bankConnectionId) return;

      try {
        setIsLoadingAccounts(true);
        setAccountsError(null);
        const allAccounts = await fetchAccounts();
        
        // Filter accounts by bankConnectionId
        const filteredAccounts = allAccounts.filter(
          (account) => account.bankConnectionId === ingestionData.bankConnectionId
        );
        
        setAccounts(filteredAccounts);
      } catch (err) {
        setAccountsError(err instanceof Error ? err : new Error("Failed to load accounts"));
        setAccounts([]);
      } finally {
        setIsLoadingAccounts(false);
      }
    }

    if (ingestionData?.bankConnectionId) {
      loadAccounts();
    }
  }, [ingestionData?.bankConnectionId]);

  const handleRetry = async () => {
    if (!ingestion || isRetrying) return;

    setIsRetrying(true);
    
    try {
      // Reload ingestion from API (retry would be handled by backend)
      const data = await fetchIngestion(ingestionId);
      const detail: IngestionDetail = {
        id: data.id,
        fileName: data.originalFileName || "unknown.pdf",
        status: data.status.toLowerCase() as "pending" | "processing" | "completed" | "failed",
        createdAt: data.createdAt,
        bankCode: "",
        pipelineStages: [],
        merchantEnrichments: [],
        transactions: [],
      };
      setIngestion(detail);
    } catch (err) {
      console.error("Failed to retry ingestion:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-12 py-8 max-w-screen-xl">
        <PageHeader title="Loading..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading ingestion...</span>
        </div>
      </div>
    );
  }

  if (error || ingestion === null) {
    return (
      <div className="px-12 py-8 max-w-screen-xl">
        <PageHeader
          title="Ingestion Not Found"
          description="The ingestion you're looking for doesn't exist."
        />
        <div className="bg-white border border-gray-200 shadow-sm p-8 mt-6">
          <p className="text-sm text-gray-600">
            Ingestion with ID <code className="font-mono bg-gray-100 px-2 py-1">{ingestionId}</code> was not found.
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-2">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 py-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={`Ingestion ${ingestion.id.slice(0, 8)}`}
          description="View ingestion details and pipeline status"
        />
        {ingestion.status === "failed" && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Ingestion
              </>
            )}
          </Button>
        )}
        {ingestion.status === "processing" && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Ingestion Summary */}
        <IngestionSummary ingestion={ingestion} />

        {/* Extracted Accounts */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Extracted Accounts</h2>
          
          {isLoadingAccounts && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading extracted accounts...</span>
            </div>
          )}

          {accountsError && (
            <div className="bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{accountsError.message}</p>
            </div>
          )}

          {!isLoadingAccounts && !accountsError && accounts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No accounts extracted yet.</p>
            </div>
          )}

          {!isLoadingAccounts && !accountsError && accounts.length > 0 && (
            <div className="space-y-3">
              {accounts.map((account) => (
                <Link
                  key={account.id}
                  href={`/dashboard/accounts/${account.id}`}
                  className="block border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {account.accountNumber}
                            {account.iban && (
                              <span className="text-gray-500 ml-2">({account.iban})</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {account.accountType} — {account.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {account.balance != null
                            ? account.balance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "N/A"}{" "}
                          {account.currency}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline Stages */}
        <PipelineChecklist stages={ingestion.pipelineStages} />

        {/* Merchant Enrichment - only show when completed */}
        {ingestion.status === "completed" &&
          ingestion.merchantEnrichments.length > 0 && (
            <MerchantEnrichmentTable
              enrichments={ingestion.merchantEnrichments}
            />
          )}

        {/* Transactions - only show when completed */}
        {ingestion.status === "completed" &&
          ingestion.transactions.length > 0 && (
            <TransactionsTable transactions={ingestion.transactions} />
          )}
      </div>
    </div>
  );
}

