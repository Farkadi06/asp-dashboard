"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { fetchAccount, fetchTransactions, type PublicAccount, type PublicTransaction } from "@/lib/api/public-client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<PublicAccount | null>(null);
  const [transactions, setTransactions] = useState<PublicTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactionsError, setTransactionsError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadAccount() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAccount(accountId);
        setAccount(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load account"));
        setAccount(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (accountId) {
      loadAccount();
    }
  }, [accountId]);

  useEffect(() => {
    async function loadTransactions() {
      if (!accountId) return;

      try {
        setIsLoadingTransactions(true);
        setTransactionsError(null);
        const data = await fetchTransactions(accountId);
        // Sort by date descending (newest first)
        const sorted = [...data.transactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sorted);
      } catch (err) {
        setTransactionsError(err instanceof Error ? err : new Error("Failed to load transactions"));
        setTransactions([]);
      } finally {
        setIsLoadingTransactions(false);
      }
    }

    if (accountId) {
      loadTransactions();
    }
  }, [accountId]);

  if (isLoading) {
    return (
      <div className="px-12 py-8 max-w-screen-xl">
        <PageHeader title="Loading..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading account...</span>
        </div>
      </div>
    );
  }

  if (error || account === null) {
    return (
      <div className="px-12 py-8 max-w-screen-xl">
        <PageHeader
          title="Account Not Found"
          description="The account you're looking for doesn't exist."
        />
        <div className="bg-white border border-gray-200 shadow-sm p-8 mt-6">
          <p className="text-sm text-gray-600">
            Account with ID <code className="font-mono bg-gray-100 px-2 py-1">{accountId}</code> was not found.
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-2">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 py-8 max-w-screen-xl">
      <PageHeader
        title={`Account ${account.accountNumber}`}
        description="View account details"
      />

      <div className="mt-6 space-y-6">
        {/* Account Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="text-sm font-medium">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="text-sm font-medium">{account.accountType}</p>
              </div>
              {account.iban && (
                <div>
                  <p className="text-sm text-gray-600">IBAN</p>
                  <p className="text-sm font-medium">{account.iban}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="text-sm font-medium">{account.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-lg font-semibold">
                  {account.balance != null
                    ? account.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "N/A"}{" "}
                  {account.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date(account.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transactions</h2>

          {isLoadingTransactions && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading transactions...</span>
            </div>
          )}

          {transactionsError && (
            <div className="bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{transactionsError.message}</p>
            </div>
          )}

          {!isLoadingTransactions && !transactionsError && transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No transactions found for this account.</p>
            </div>
          )}

          {!isLoadingTransactions && !transactionsError && transactions.length > 0 && (
            <div className="border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.merchant || transaction.description}
                      </TableCell>
                      <TableCell
                        className={`text-sm font-medium ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : transaction.amount < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {transaction.currency}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {transaction.category || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {transaction.rawDescription ? "CARD" : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

