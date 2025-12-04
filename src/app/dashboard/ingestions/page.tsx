"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { FileText, Loader2 } from "lucide-react";
import { fetchIngestions, type PublicIngestion } from "@/lib/api/public-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function IngestionsPage() {
  const [ingestions, setIngestions] = useState<PublicIngestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadIngestions() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchIngestions();
        setIngestions(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load ingestions"));
      } finally {
        setIsLoading(false);
      }
    }
    loadIngestions();
  }, []);

  if (isLoading) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="Ingestions"
          description="View and manage your PDF ingestions"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading ingestions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="Ingestions"
          description="View and manage your PDF ingestions"
        />
        <div className="bg-red-50 border border-red-200 p-4 mt-6">
          <p className="text-sm font-medium text-red-800 mb-2">Failed to load ingestions</p>
          <p className="text-xs text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  if (ingestions.length === 0) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="Ingestions"
          description="View and manage your PDF ingestions"
        />
        <EmptyStateCard
          icon={FileText}
          title="No ingestions yet"
          description="Upload a PDF to create your first ingestion."
        />
      </div>
    );
  }

  return (
    <div className="px-12 py-8">
      <PageHeader
        title="Ingestions"
        description="View and manage your PDF ingestions"
      />

      <div className="mt-6 border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingestions.map((ingestion) => (
              <TableRow key={ingestion.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/ingestions/${ingestion.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {ingestion.id.slice(0, 8)}...
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {ingestion.originalFileName || "N/A"}
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded ${
                    ingestion.status === "PROCESSED" || ingestion.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : ingestion.status === "FAILED" || ingestion.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {ingestion.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(ingestion.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
