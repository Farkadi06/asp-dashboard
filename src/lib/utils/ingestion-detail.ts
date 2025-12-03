/**
 * Utility functions for ingestion detail page
 */

import { IngestionDetail, PipelineStage, MerchantEnrichment } from "@/lib/types/ingestion-detail";
import { Transaction } from "@/lib/types/transaction";

/**
 * Generates mock pipeline stages
 */
export function generateMockPipelineStages(
  completed: boolean = false
): PipelineStage[] {
  const stages: PipelineStage[] = [
    {
      id: "upload",
      name: "PDF Uploaded",
      description: "PDF file successfully uploaded and validated",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
    {
      id: "extract",
      name: "Text Extracted",
      description: "Text content extracted from PDF using OCR",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
    {
      id: "template",
      name: "Bank Template Identified",
      description: "Bank statement template automatically detected",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
    {
      id: "parse",
      name: "Transactions Parsed",
      description: "Transaction data extracted and structured",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
    {
      id: "merchant",
      name: "Merchant Cleaned",
      description: "Merchant names normalized and standardized",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
    {
      id: "categorize",
      name: "Categorization Completed",
      description: "Transactions automatically categorized",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
    {
      id: "salary",
      name: "Salary Detection",
      description: "Salary and income transactions identified",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
    {
      id: "recurring",
      name: "Recurring Payments Detection",
      description: "Recurring payment patterns detected",
      completed: completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    },
  ];

  return stages;
}

/**
 * Generates mock merchant enrichments
 */
export function generateMockMerchantEnrichments(): MerchantEnrichment[] {
  return [
    {
      id: "merchant_1",
      rawMerchant: "STARBUCKS STORE #12345",
      cleanedMerchant: "Starbucks",
      category: "Food & Dining",
      confidenceScore: 0.95,
    },
    {
      id: "merchant_2",
      rawMerchant: "AMAZON.COM*ABC123",
      cleanedMerchant: "Amazon",
      category: "Shopping",
      confidenceScore: 0.98,
    },
    {
      id: "merchant_3",
      rawMerchant: "ACME CORP PAYROLL",
      cleanedMerchant: "ACME Corp",
      category: "Income",
      confidenceScore: 0.92,
    },
    {
      id: "merchant_4",
      rawMerchant: "NETFLIX.COM",
      cleanedMerchant: "Netflix",
      category: "Entertainment",
      confidenceScore: 0.99,
    },
  ];
}

/**
 * Generates mock enriched transactions
 */
export function generateMockEnrichedTransactions(): Transaction[] {
  return [
    {
      id: "txn_1",
      date: "2024-01-03",
      description: "Starbucks",
      amount: -3.5,
      currency: "USD",
      status: "completed",
      category: "Food & Dining",
    },
    {
      id: "txn_2",
      date: "2024-01-03",
      description: "Salary – ACME Corp",
      amount: 3500,
      currency: "USD",
      status: "completed",
      category: "Income",
    },
    {
      id: "txn_3",
      date: "2024-01-04",
      description: "Amazon",
      amount: -89.99,
      currency: "USD",
      status: "completed",
      category: "Shopping",
    },
    {
      id: "txn_4",
      date: "2024-01-05",
      description: "Netflix",
      amount: -15.99,
      currency: "USD",
      status: "completed",
      category: "Entertainment",
    },
    {
      id: "txn_5",
      date: "2024-01-06",
      description: "Uber",
      amount: -12.50,
      currency: "USD",
      status: "completed",
      category: "Transportation",
    },
  ];
}

/**
 * Creates a mock ingestion detail
 */
export function createMockIngestionDetail(
  id: string,
  fileName: string,
  status: "processing" | "completed" | "failed" = "completed"
): IngestionDetail {
  const isCompleted = status === "completed";
  const createdAt = new Date().toISOString();

  return {
    id,
    fileName,
    status,
    createdAt,
    completedAt: isCompleted ? new Date().toISOString() : undefined,
    processingTime: isCompleted ? 2.5 : undefined,
    bankTemplate: isCompleted ? "Chase Bank Statement" : undefined,
    parsedTransactionCount: isCompleted ? 5 : undefined,
    pipelineStages: generateMockPipelineStages(isCompleted),
    merchantEnrichments: isCompleted ? generateMockMerchantEnrichments() : [],
    transactions: isCompleted ? generateMockEnrichedTransactions() : [],
  };
}

/**
 * Simulates pipeline processing by completing stages progressively
 */
export function simulatePipelineProcessing(
  stages: PipelineStage[],
  onStageComplete: (stageId: string) => void,
  onComplete: () => void
): () => void {
  let currentIndex = 0;
  const timeouts: NodeJS.Timeout[] = [];

  stages.forEach((stage, index) => {
    if (!stage.completed) {
      const timeout = setTimeout(() => {
        onStageComplete(stage.id);
        currentIndex++;

        if (currentIndex === stages.filter((s) => !s.completed).length) {
          onComplete();
        }
      }, (index + 1) * 300); // 300ms between each stage

      timeouts.push(timeout);
    }
  });

  // Return cleanup function
  return () => {
    timeouts.forEach(clearTimeout);
  };
}

