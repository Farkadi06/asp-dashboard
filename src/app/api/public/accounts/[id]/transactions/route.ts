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

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Build query string from search params
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
    if (searchParams.get("merchant")) {
      queryParams.append("merchant", searchParams.get("merchant")!);
    }

    const query = queryParams.toString();
    const endpoint = `/accounts/${accountId}/transactions${query ? `?${query}` : ""}`;

    const client = getServerAspClient();
    const data = await client.get(endpoint);
    
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch transactions:", err);
    const status = err.status || 500;
    const data = err.data || { error: "FETCH_TRANSACTIONS_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

