"use client";

import { useState } from "react";
import { type EnrichedTransaction, type PublicAccount } from "@/lib/api/public-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrichedTransactionsTable } from "@/components/enriched-transactions/EnrichedTransactionsTable";

interface EnrichedClientProps {
  account: PublicAccount;
  accountId: string;
  initialData: {
    transactions: EnrichedTransaction[];
    pagination?: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}

export default function EnrichedClient({ account, accountId, initialData }: EnrichedClientProps) {
  const [allTransactions] = useState<EnrichedTransaction[]>(initialData.transactions);

  return (
    <div className="space-y-6">
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

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Enriched Transactions</h2>
        </div>

        <EnrichedTransactionsTable transactions={allTransactions} />
      </div>
    </div>
  );
}

