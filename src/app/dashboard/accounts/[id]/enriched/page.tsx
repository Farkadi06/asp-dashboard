import Link from "next/link";
import { fetchAccount, fetchEnrichedTransactions } from "@/lib/api/public-client";
import EnrichedClient from "./EnrichedClient";

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

      {/* Client Component with Filters and Table */}
      <EnrichedClient account={account} accountId={accountId} initialData={enriched} />
    </div>
  );
}

