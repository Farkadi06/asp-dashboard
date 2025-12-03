"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import {
  IngestionSummary,
  PipelineChecklist,
  MerchantEnrichmentTable,
  TransactionsTable,
} from "@/components/dashboard/ingestions";
import { IngestionDetail } from "@/lib/types/ingestion-detail";
import {
  createMockIngestionDetail,
  generateMockPipelineStages,
  generateMockMerchantEnrichments,
  generateMockEnrichedTransactions,
  simulatePipelineProcessing,
} from "@/lib/utils/ingestion-detail";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export default function IngestionDetailPage() {
  const params = useParams();
  const ingestionId = params.id as string;

  const [ingestion, setIngestion] = useState<IngestionDetail | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Load ingestion from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("asp_mock_ingestions");
      if (stored) {
        try {
          const ingestions = JSON.parse(stored);
          const found = ingestions.find((ing: any) => ing.id === ingestionId);
          if (found) {
            // Convert to IngestionDetail format
            const detail: IngestionDetail = {
              ...found,
              pipelineStages: found.pipelineStages || generateMockPipelineStages(found.status === "completed"),
              merchantEnrichments: found.merchantEnrichments || (found.status === "completed" ? generateMockMerchantEnrichments() : []),
              transactions: found.transactions || (found.status === "completed" ? generateMockEnrichedTransactions() : []),
              processingTime: found.processingTime || (found.status === "completed" ? 2.5 : undefined),
              bankTemplate: found.bankTemplate || (found.status === "completed" ? "Chase Bank Statement" : undefined),
              parsedTransactionCount: found.parsedTransactionCount || (found.status === "completed" ? 5 : undefined),
            };
            setIngestion(detail);
            return;
          }
        } catch (e) {
          console.error("Failed to load ingestion", e);
        }
      }

      // If not found, set to null to show "not found" message
      setIngestion(null);
    }
  }, [ingestionId]);

  const handleRetry = () => {
    if (!ingestion || isRetrying) return;

    setIsRetrying(true);

    // Reset to processing state
    const processingIngestion: IngestionDetail = {
      ...ingestion,
      status: "processing",
      pipelineStages: generateMockPipelineStages(false),
      merchantEnrichments: [],
      transactions: [],
      processingTime: undefined,
      bankTemplate: undefined,
      parsedTransactionCount: undefined,
    };

    setIngestion(processingIngestion);

    // Simulate processing with progressive stage completion
    const cleanup = simulatePipelineProcessing(
      processingIngestion.pipelineStages,
      (stageId) => {
        setIngestion((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pipelineStages: prev.pipelineStages.map((stage) =>
              stage.id === stageId
                ? {
                    ...stage,
                    completed: true,
                    completedAt: new Date().toISOString(),
                  }
                : stage
            ),
          };
        });
      },
      () => {
        // All stages completed
        const completedIngestion: IngestionDetail = {
          ...processingIngestion,
          status: "completed",
          completedAt: new Date().toISOString(),
          processingTime: 2.5,
          bankTemplate: "Chase Bank Statement",
          parsedTransactionCount: 5,
          pipelineStages: generateMockPipelineStages(true),
          merchantEnrichments: generateMockMerchantEnrichments(),
          transactions: generateMockEnrichedTransactions(),
        };

        setIngestion(completedIngestion);
        setIsRetrying(false);

        // Save to localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("asp_mock_ingestions");
          const ingestions = stored ? JSON.parse(stored) : [];
          const index = ingestions.findIndex((ing: any) => ing.id === ingestionId);
          if (index >= 0) {
            ingestions[index] = completedIngestion;
          } else {
            ingestions.push(completedIngestion);
          }
          localStorage.setItem("asp_mock_ingestions", JSON.stringify(ingestions));

          // Dispatch event for dashboard updates
          window.dispatchEvent(
            new CustomEvent("ingestionsChanged", {
              detail: ingestions.filter((ing: any) => ing.status === "completed").length,
            })
          );
        }
      }
    );

    // Cleanup on unmount
    return cleanup;
  };

  if (ingestion === null) {
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
        </div>
      </div>
    );
  }

  if (!ingestion) {
    return (
      <div className="px-12 py-8 max-w-screen-xl">
        <PageHeader title="Loading..." />
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

