import Link from "next/link";
import { fetchAccount, fetchEnrichedTransactions } from "@/lib/api/public-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EnrichedAccountPage({ params }: PageProps) {
  const { id: accountId } = await params;

  let account;
  let enriched;
  let error: string | null = null;

  try {
    account = await fetchAccount(accountId);
    enriched = await fetchEnrichedTransactions(accountId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load data";
    console.error("Error loading enriched transactions:", err);
  }

  if (error || !account || !enriched) {
    return (
      <div className="px-12 py-8 max-w-screen-xl">
        <Link
          href={`/dashboard/accounts/${accountId}`}
          className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
        >
          ← Back to raw transactions
        </Link>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-sm text-red-800">
            {error || "Failed to load enriched transactions"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 py-8 max-w-screen-xl">
      {/* Back Link */}
      <Link
        href={`/dashboard/accounts/${accountId}`}
        className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
      >
        ← Back to raw transactions
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold">
            Account {account.accountNumber}
          </h1>
          <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 font-medium rounded">
            Enriched View
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
            Enriched with ASP Intelligence
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          View enriched transactions with merchant names, categories, and intelligent insights
        </p>
      </div>

      {/* Account Summary */}
      <Card className="mb-6">
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

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Enriched Transactions</h2>
          <div className="text-sm text-gray-500">
            Total: {enriched.pagination?.total ?? enriched.transactions.length} | 
            Showing: {enriched.transactions.length} | 
            Income: {enriched.transactions.filter(tx => {
              // Use direction if available, otherwise derive from amount
              if (tx.direction) {
                return tx.direction === "INCOME";
              }
              return tx.amount > 0; // Positive amount = credit = income
            }).length} | 
            Expense: {enriched.transactions.filter(tx => {
              // Use direction if available, otherwise derive from amount
              if (tx.direction) {
                return tx.direction === "EXPENSE";
              }
              return tx.amount < 0; // Negative amount = debit = expense
            }).length}
          </div>
        </div>

        {enriched.transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No enriched transactions found.</p>
            {enriched.pagination?.total !== undefined && enriched.pagination.total > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Note: Backend reports {enriched.pagination.total} total transactions, but none were returned.
              </p>
            )}
          </div>
        ) : (
          <div className="border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enriched.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3 align-top">
                      <div className="flex flex-col">
                        {/* MAIN LABEL */}
                        <span className="font-medium">
                          {tx.merchantName ?? tx.descriptionClean ?? "Unknown"}
                        </span>

                        {/* RAW DESCRIPTION */}
                        {tx.descriptionRaw && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {tx.descriptionRaw}
                          </span>
                        )}

                        {/* CATEGORY + SUBCATEGORY */}
                        <div className="flex gap-2 mt-1">
                          {tx.category && (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                              {tx.category}
                            </span>
                          )}
                          {tx.subcategory && (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                              {tx.subcategory}
                            </span>
                          )}
                        </div>

                        {/* SALARY + RECURRING BADGES */}
                        <div className="flex gap-2 mt-1">
                          {tx.salary && (
                            <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                              Salary
                            </span>
                          )}
                          {tx.recurring && (
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                              Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {(() => {
                        // Determine direction: use field if available, otherwise derive from amount
                        const isIncome = tx.direction === "INCOME" || (!tx.direction && tx.amount > 0);
                        const direction = tx.direction || (tx.amount > 0 ? "INCOME" : "EXPENSE");
                        return (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              isIncome
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {direction}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell
                      className="py-3 text-right font-medium"
                      style={{
                        color: (() => {
                          // Determine color: use direction if available, otherwise derive from amount
                          // Credit transactions (positive amounts) = INCOME = green
                          // Debit transactions (negative amounts) = EXPENSE = red
                          const isIncome = tx.direction === "INCOME" || (!tx.direction && tx.amount > 0);
                          return isIncome ? "#059669" : "#dc2626";
                        })(),
                      }}
                    >
                      {tx.amount.toFixed(2)} {tx.currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

