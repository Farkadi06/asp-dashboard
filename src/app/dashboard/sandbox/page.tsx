"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import {
  Dropzone,
  IngestionStatusCard,
  TransactionsTable,
  InstitutionBrowser,
} from "@/components/dashboard/sandbox";
import { Ingestion } from "@/lib/types/ingestion";
import { Transaction } from "@/lib/types/transaction";
import {
  createMockIngestion,
  generateMockTransactions,
} from "@/lib/utils/sandbox";
import { toast } from "sonner";

const STORAGE_KEY = "asp_mock_ingestions";

export default function SandboxPage() {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [currentIngestion, setCurrentIngestion] = useState<Ingestion | null>(
    null
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load last ingestion from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const ingestions: Ingestion[] = JSON.parse(stored);
          const lastIngestion = ingestions[ingestions.length - 1];
          if (lastIngestion) {
            setCurrentIngestion(lastIngestion);
            // If completed, load transactions
            if (lastIngestion.status === "completed") {
              const storedTransactions = localStorage.getItem(
                `asp_mock_transactions_${lastIngestion.id}`
              );
              if (storedTransactions) {
                setTransactions(JSON.parse(storedTransactions));
              }
            }
          }
        } catch (e) {
          console.error("Failed to load ingestions", e);
        }
      }
    }
  }, []);

  // Simulate processing when ingestion is created
  useEffect(() => {
    if (currentIngestion && currentIngestion.status === "processing") {
      setIsUploading(true);
      
      // Simulate processing delay (2-3 seconds)
      const processingTime = 2000 + Math.random() * 1000;
      
      const timer = setTimeout(() => {
        const mockTransactions = generateMockTransactions();
        const completedIngestion: Ingestion = {
          ...currentIngestion,
          status: "completed",
          completedAt: new Date().toISOString(),
        };

        setCurrentIngestion(completedIngestion);
        setTransactions(mockTransactions);
        setIsUploading(false);

        // Save to localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(STORAGE_KEY);
          const ingestions: Ingestion[] = stored
            ? JSON.parse(stored)
            : [];
          
          // Update or add the ingestion
          const existingIndex = ingestions.findIndex(
            (ing) => ing.id === completedIngestion.id
          );
          if (existingIndex >= 0) {
            ingestions[existingIndex] = completedIngestion;
          } else {
            ingestions.push(completedIngestion);
          }

          localStorage.setItem(STORAGE_KEY, JSON.stringify(ingestions));
          localStorage.setItem(
            `asp_mock_transactions_${completedIngestion.id}`,
            JSON.stringify(mockTransactions)
          );

          // Dispatch event for onboarding integration
          window.dispatchEvent(
            new CustomEvent("ingestionsChanged", {
              detail: ingestions.filter((ing) => ing.status === "completed")
                .length,
            })
          );
        }
      }, processingTime);

      return () => clearTimeout(timer);
    }
  }, [currentIngestion]);

  const handleFileSelect = (file: File) => {
    if (!selectedBank) {
      toast.error("Please select a bank first");
      return;
    }

    const newIngestion = createMockIngestion(file.name, selectedBank);
    setCurrentIngestion(newIngestion);
    setTransactions([]);
    setIsUploading(true);

    // Save initial ingestion to localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      const ingestions: Ingestion[] = stored ? JSON.parse(stored) : [];
      ingestions.push(newIngestion);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ingestions));
    }
  };

  const handleDelete = () => {
    if (!currentIngestion) return;

    // Remove from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ingestions: Ingestion[] = JSON.parse(stored);
        const filtered = ingestions.filter((ing) => ing.id !== currentIngestion.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        // Remove transactions
        localStorage.removeItem(`asp_mock_transactions_${currentIngestion.id}`);

        // Dispatch event for dashboard updates
        window.dispatchEvent(
          new CustomEvent("ingestionsChanged", {
            detail: filtered.filter((ing) => ing.status === "completed").length,
          })
        );
      }
    }

    // Clear state
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
              onSelect={setSelectedBank}
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
