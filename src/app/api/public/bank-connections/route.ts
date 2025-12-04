import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

export async function GET(request: Request) {
  try {
    const client = getServerAspClient();
    const { searchParams } = new URL(request.url);
    const userRef = searchParams.get("userRef");
    
    // Build endpoint with optional query parameter
    let endpoint = "/bank-connections";
    if (userRef) {
      endpoint += `?userRef=${encodeURIComponent(userRef)}`;
    }
    
    const result = await client.get(endpoint);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch bank connections:", err);
    const status = err.status || 500;
    const data = err.data || { error: "FETCH_BANK_CONNECTIONS_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

