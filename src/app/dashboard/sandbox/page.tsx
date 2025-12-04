"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import {
  Dropzone,
  IngestionStatusCard,
  TransactionsTable,
  InstitutionBrowser,
} from "@/components/dashboard/sandbox";
import { Ingestion } from "@/lib/types/ingestion";
import { Transaction } from "@/lib/types/transaction";
import { createIngestion } from "@/lib/api/public-client";
import { toast } from "sonner";

export default function SandboxPage() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankConnectionId, setBankConnectionId] = useState<string | null>(null);
  const [currentIngestion, setCurrentIngestion] = useState<Ingestion | null>(
    null
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle bank connection creation - store connectionId
  const handleBankConnection = (connectionId: string) => {
    setBankConnectionId(connectionId);
  };

  const handleFileSelect = async (file: File) => {
    if (!bankConnectionId) {
      toast.error("Please select a bank and create a connection first");
      return;
    }

    try {
      setIsUploading(true);
      const result = await createIngestion(bankConnectionId, file);
      
      // Map API response to local Ingestion type
      const newIngestion: Ingestion = {
        id: result.id,
        fileName: result.originalFileName || file.name,
        status: result.status.toLowerCase() as "pending" | "processing" | "completed" | "failed",
        createdAt: result.createdAt,
        bankCode: selectedBank || "",
      };

      setCurrentIngestion(newIngestion);
      setTransactions([]);
      
      toast.success("Ingestion created successfully");
      
      // Navigate to ingestion detail page if available
      router.push(`/dashboard/ingestions/${result.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create ingestion";
      toast.error(errorMessage);
      console.error("Failed to create ingestion:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (!currentIngestion) return;

    // Clear state (ingestion deletion will be handled by backend)
    setCurrentIngestion(null);
    setTransactions([]);
    setIsUploading(false);
  };

  return (
    <div className="px-12 py-8 max-w-screen-xl">
      <PageHeader
        title="Sandbox"
        description="Upload a bank statement PDF to simulate an ingestion."
      />

      <div className="space-y-6 mt-6">
        {/* Institution Browser - only show if no active ingestion or ingestion is completed */}
        {(!currentIngestion ||
          currentIngestion.status === "completed" ||
          currentIngestion.status === "failed") && (
          <div className="mb-6">
            <InstitutionBrowser
              selectedBank={selectedBank}
              onSelect={(bankId) => {
                setSelectedBank(bankId);
                // Connection creation is handled inside InstitutionBrowser
                // We'll get the connectionId from the success callback
              }}
              onConnectionCreated={handleBankConnection}
            />
          </div>
        )}

        {/* Dropzone - only show if no active ingestion or ingestion is completed */}
        {(!currentIngestion ||
          currentIngestion.status === "completed" ||
          currentIngestion.status === "failed") && (
          <Dropzone
            onFileSelect={handleFileSelect}
            disabled={isUploading}
            bankSelected={!!selectedBank}
          />
        )}

        {/* Status Card - show when ingestion exists */}
        {currentIngestion && (
          <IngestionStatusCard
            id={currentIngestion.id}
            fileName={currentIngestion.fileName}
            status={currentIngestion.status}
            createdAt={currentIngestion.createdAt}
            transactionCount={
              currentIngestion.status === "completed"
                ? transactions.length
                : undefined
            }
            onDelete={handleDelete}
          />
        )}

        {/* Transactions Table - only show when completed */}
        {currentIngestion?.status === "completed" &&
          transactions.length > 0 && (
            <TransactionsTable transactions={transactions} />
          )}
      </div>
    </div>
  );
}
