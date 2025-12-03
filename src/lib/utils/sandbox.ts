/**
 * Utility functions for sandbox ingestion simulation
 */

import { Ingestion } from "@/lib/types/ingestion";
import { Transaction } from "@/lib/types/transaction";

/**
 * Generates a random UUID-like ID
 */
export function generateIngestionId(): string {
  return `ing_${Math.floor(Math.random() * 9000 + 1000)}`;
}

/**
 * Generates a transaction ID
 */
export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a mock ingestion object
 */
export function createMockIngestion(fileName: string, bankCode?: string): Ingestion {
  return {
    id: generateIngestionId(),
    bankCode,
    fileName,
    status: "processing",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generates mock transactions for a completed ingestion
 */
export function generateMockTransactions(): Transaction[] {
  return [
    {
      id: generateTransactionId(),
      date: "2024-01-03",
      description: "Starbucks",
      amount: -3.5,
      currency: "USD",
      status: "completed",
      category: "Food",
    },
    {
      id: generateTransactionId(),
      date: "2024-01-03",
      description: "Salary – ACME Corp",
      amount: 3500,
      currency: "USD",
      status: "completed",
      category: "Income",
    },
    {
      id: generateTransactionId(),
      date: "2024-01-04",
      description: "Amazon",
      amount: -89.99,
      currency: "USD",
      status: "completed",
      category: "Shopping",
    },
  ];
}

/**
 * Gets the count of completed ingestions from localStorage
 */
export function getIngestionCount(): number {
  if (typeof window === "undefined") return 0;
  
  const stored = localStorage.getItem("asp_mock_ingestions");
  if (!stored) return 0;
  
  try {
    const ingestions: Ingestion[] = JSON.parse(stored);
    return ingestions.filter((ing) => ing.status === "completed").length;
  } catch {
    return 0;
  }
}

