import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

/**
 * GET /api/public/api-key
 * Fetches the current tenant's API key metadata
 */
export async function GET() {
  try {
    const client = getServerAspClient();
    const data = await client.get("/api-key");
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch API key metadata:", err);
    return NextResponse.json(
      { error: "FETCH_API_KEY_METADATA_FAILED", message: String(err) },
      { status: 500 }
    );
  }
}

