"use client";

import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface IngestionStatusCardProps {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  transactionCount?: number;
  onDelete?: () => void;
}

export function IngestionStatusCard({
  id,
  fileName,
  status,
  createdAt,
  transactionCount,
  onDelete,
}: IngestionStatusCardProps) {
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

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Ingestion #{id.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-600">{fileName}</p>
        </div>
        <div className="flex items-center gap-2">
          {(status === "processing" || status === "pending") && (
            <>
              <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
              <span className="text-sm font-medium text-yellow-600">
                Processing…
              </span>
            </>
          )}
          {status === "completed" && (
            <>
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <span className="text-sm font-medium text-green-600">
                Completed
              </span>
            </>
          )}
          {status === "failed" && (
            <>
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              <span className="text-sm font-medium text-red-600">Failed</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500">Created:</span>{" "}
            <span className="font-medium">{formatDate(createdAt)}</span>
          </div>
          {status === "completed" && transactionCount !== undefined && (
            <div>
              <span className="text-gray-500">Transactions:</span>{" "}
              <span className="font-medium">{transactionCount}</span>
            </div>
          )}
        </div>
        {onDelete && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </>
  );

  if (status === "completed") {
    return (
      <Link
        href={`/dashboard/ingestions/${id}`}
        className="block bg-white border border-gray-200 shadow-sm p-5 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm p-5">
      {cardContent}
    </div>
  );
}

