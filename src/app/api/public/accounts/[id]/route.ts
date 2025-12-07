import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let accountId: string = "unknown";
  try {
    const { id } = await params;
    accountId = id;
    
    // Log for debugging
    console.log(`[Account Route] Fetching account ${accountId}`);
    
    const client = await getServerAspClient();
    const data = await client.get(`/accounts/${accountId}`);
    
    console.log(`[Account Route] Successfully fetched account ${accountId}`);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    // Try to get accountId if params wasn't awaited yet
    if (accountId === "unknown") {
      try {
        const { id } = await params;
        accountId = id;
      } catch {
        // Keep "unknown" if params can't be awaited
      }
    }
    
    console.error("[Account Route] Failed to fetch account:", {
      accountId,
      error: err,
      status: err.status,
      data: err.data,
      message: err.message,
    });
    const status = err.status || 500;
    const data = err.data || { error: "FETCH_ACCOUNT_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

