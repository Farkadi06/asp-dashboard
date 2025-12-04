import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;

    if (!accountId) {
      return NextResponse.json(
        { error: "MISSING_ACCOUNT_ID" },
        { status: 400 }
      );
    }

    const client = getServerAspClient();
    
    // Build query string from search params if needed
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const queryParams = new URLSearchParams();
    
    if (searchParams.get("startDate")) {
      queryParams.append("startDate", searchParams.get("startDate")!);
    }
    if (searchParams.get("endDate")) {
      queryParams.append("endDate", searchParams.get("endDate")!);
    }
    if (searchParams.get("limit")) {
      queryParams.append("limit", searchParams.get("limit")!);
    }
    if (searchParams.get("offset")) {
      queryParams.append("offset", searchParams.get("offset")!);
    }
    if (searchParams.get("category")) {
      queryParams.append("category", searchParams.get("category")!);
    }
    if (searchParams.get("subcategory")) {
      queryParams.append("subcategory", searchParams.get("subcategory")!);
    }
    if (searchParams.get("merchant")) {
      queryParams.append("merchant", searchParams.get("merchant")!);
    }
    if (searchParams.get("direction")) {
      queryParams.append("direction", searchParams.get("direction")!);
    }
    if (searchParams.get("salary")) {
      queryParams.append("salary", searchParams.get("salary")!);
    }
    if (searchParams.get("recurring")) {
      queryParams.append("recurring", searchParams.get("recurring")!);
    }
    
    const query = queryParams.toString();
    const endpoint = `/accounts/${accountId}/enriched-transactions${query ? `?${query}` : ""}`;
    
    console.log("[Enriched Transactions] Fetching:", endpoint);
    const data = await client.get(endpoint);
    
    // Log transaction counts for debugging
    if (data && typeof data === 'object' && 'transactions' in data && Array.isArray((data as any).transactions)) {
      const transactions = (data as any).transactions;
      const incomeCount = transactions.filter((tx: any) => tx.direction === "INCOME" || (!tx.direction && tx.amount > 0)).length;
      const expenseCount = transactions.filter((tx: any) => tx.direction === "EXPENSE" || (!tx.direction && tx.amount < 0)).length;
      console.log("[Enriched Transactions] Response:", {
        total: transactions.length,
        income: incomeCount,
        expense: expenseCount,
        pagination: (data as any).pagination,
      });
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch enriched transactions:", err);
    const status = err.status || 500;
    const errorMessage = err.data?.message || err.message || String(err);
    const data = err.data || { 
      error: "FETCH_ENRICHED_FAILED", 
      message: errorMessage,
    };
    return NextResponse.json(data, { status });
  }
}

