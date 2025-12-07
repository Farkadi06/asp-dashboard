import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

// GET /api/public/accounts -> GET /v1/accounts
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userRef = url.searchParams.get("userRef") ?? undefined;

    const client = await getServerAspClient();

    const endpoint = userRef
      ? `/accounts?userRef=${encodeURIComponent(userRef)}`
      : "/accounts";

    const accounts = await client.get(endpoint);

    return NextResponse.json(accounts, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch accounts:", err);
    const status = err.status || 500;
    const data = err.data || { error: "FETCH_ACCOUNTS_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

