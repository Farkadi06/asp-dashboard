import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

export async function POST(request: Request) {
  try {
    const client = await getServerAspClient();
    const body = await request.json();
    const { bankId, userRef } = body;

    if (!bankId) {
      return NextResponse.json(
        { error: "MISSING_BANK_ID" },
        { status: 400 }
      );
    }

    // userRef is required by the API, use a default if not provided
    const requestBody = {
      userRef: userRef || "default_user",
    };

    const result = await client.post(`/bank-connections/${bankId}/connect`, requestBody);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Failed to create bank connection:", err);
    const status = err.status || 500;
    const data = err.data || { error: "BANK_CONNECTION_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

