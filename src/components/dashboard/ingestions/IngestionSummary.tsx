"use client";

import { cn } from "@/lib/utils";
import { IngestionDetail } from "@/lib/types/ingestion-detail";
import { getBankByCode } from "@/lib/config/banks";

interface IngestionSummaryProps {
  ingestion: IngestionDetail;
}

export function IngestionSummary({ ingestion }: IngestionSummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      processing: { label: "Processing", color: "text-yellow-600" },
      completed: { label: "Completed", color: "text-green-600" },
      failed: { label: "Failed", color: "text-red-600" },
      pending: { label: "Pending", color: "text-gray-600" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = formatStatus(ingestion.status);

  return (
    <div className="bg-white border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Ingestion Summary
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Ingestion ID</p>
          <p className="text-sm font-mono text-gray-900">{ingestion.id}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">File Name</p>
          <p className="text-sm text-gray-900">{ingestion.fileName}</p>
          {ingestion.bankCode && (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">Bank:</p>
              {(() => {
                const bank = getBankByCode(ingestion.bankCode!);
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">
                        {ingestion.bankCode!.slice(0, 2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {bank?.name || ingestion.bankCode}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <p className={cn("text-sm font-medium", statusInfo.color)}>
            {statusInfo.label}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Created At</p>
          <p className="text-sm text-gray-900">{formatDate(ingestion.createdAt)}</p>
        </div>

        {ingestion.processingTime && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Processing Time</p>
            <p className="text-sm text-gray-900">
              {ingestion.processingTime.toFixed(1)}s
            </p>
          </div>
        )}

        {ingestion.bankTemplate && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Bank Template</p>
            <p className="text-sm text-gray-900">{ingestion.bankTemplate}</p>
          </div>
        )}

        {ingestion.parsedTransactionCount !== undefined && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Parsed Transactions</p>
            <p className="text-sm text-gray-900">
              {ingestion.parsedTransactionCount}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

