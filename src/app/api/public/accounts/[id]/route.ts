import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getServerAspClient();
    const data = await client.get(`/accounts/${id}`);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch account:", err);
    const status = err.status || 500;
    const data = err.data || { error: "FETCH_ACCOUNT_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

