export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "failed";
  category?: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
}

