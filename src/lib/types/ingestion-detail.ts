import { Ingestion } from "./ingestion";
import { Transaction } from "./transaction";

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface MerchantEnrichment {
  id: string;
  rawMerchant: string;
  cleanedMerchant: string;
  category: string;
  confidenceScore: number;
}

export interface IngestionDetail extends Ingestion {
  bankCode?: string;
  processingTime?: number; // in seconds
  bankTemplate?: string;
  parsedTransactionCount?: number;
  pipelineStages: PipelineStage[];
  merchantEnrichments: MerchantEnrichment[];
  transactions: Transaction[];
}

