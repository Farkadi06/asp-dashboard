"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/lib/types/transaction";
import { cn } from "@/lib/utils";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTypeLabel = (amount: number) => {
    return amount >= 0 ? "Credit" : "Debit";
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Enriched Transactions
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {transactions.length} transactions parsed, normalized, and enriched
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-sm text-gray-600">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell className="text-sm font-medium text-gray-900">
                {transaction.description}
              </TableCell>
              <TableCell
                className={cn(
                  "text-sm font-medium text-right",
                  transaction.amount >= 0
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {formatAmount(transaction.amount)}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {transaction.description}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                  {transaction.category || "Uncategorized"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 text-xs font-medium",
                    transaction.amount >= 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {getTypeLabel(transaction.amount)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

