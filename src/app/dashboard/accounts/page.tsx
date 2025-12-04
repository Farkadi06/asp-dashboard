"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { CreditCard, Loader2 } from "lucide-react";
import { fetchAccounts, type PublicAccount } from "@/lib/api/public-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<PublicAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAccounts();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load accounts"));
      } finally {
        setIsLoading(false);
      }
    }
    loadAccounts();
  }, []);

  if (isLoading) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="Accounts"
          description="View and manage your bank accounts"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading accounts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="Accounts"
          description="View and manage your bank accounts"
        />
        <div className="bg-red-50 border border-red-200 p-4 mt-6">
          <p className="text-sm font-medium text-red-800 mb-2">Failed to load accounts</p>
          <p className="text-xs text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="px-12 py-8">
        <PageHeader
          title="Accounts"
          description="View and manage your bank accounts"
        />
        <EmptyStateCard
          icon={CreditCard}
          title="No accounts yet"
          description="Accounts will appear here after processing bank statements."
        />
      </div>
    );
  }

  return (
    <div className="px-12 py-8">
      <PageHeader
        title="Accounts"
        description="View and manage your bank accounts"
      />

      <div className="mt-6 border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/accounts/${account.id}`}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    {account.accountNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{account.accountType}</TableCell>
                <TableCell className="text-sm font-medium">
                  {account.balance != null
                    ? account.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{account.currency}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(account.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

