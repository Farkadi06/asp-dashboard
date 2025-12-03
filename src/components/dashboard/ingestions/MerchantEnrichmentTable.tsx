"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MerchantEnrichment } from "@/lib/types/ingestion-detail";
import { cn } from "@/lib/utils";

interface MerchantEnrichmentTableProps {
  enrichments: MerchantEnrichment[];
}

export function MerchantEnrichmentTable({
  enrichments,
}: MerchantEnrichmentTableProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Merchant Enrichment
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Raw merchant names normalized and categorized automatically
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Raw Merchant</TableHead>
            <TableHead>Cleaned Merchant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Confidence Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrichments.map((enrichment) => (
            <TableRow key={enrichment.id}>
              <TableCell className="text-sm text-gray-600">
                {enrichment.rawMerchant}
              </TableCell>
              <TableCell className="text-sm font-medium text-gray-900">
                {enrichment.cleanedMerchant}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                  {enrichment.category}
                </span>
              </TableCell>
              <TableCell
                className={cn(
                  "text-sm font-medium text-right",
                  getConfidenceColor(enrichment.confidenceScore)
                )}
              >
                {(enrichment.confidenceScore * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

