import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

/**
 * POST /api/public/api-key/regenerate
 * Regenerates the current tenant's API key
 */
export async function POST() {
  try {
    const client = getServerAspClient();
    const data = await client.post("/api-key/regenerate", {});
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Failed to regenerate API key:", err);
    return NextResponse.json(
      { error: "REGENERATE_API_KEY_FAILED", message: String(err) },
      { status: 500 }
    );
  }
}

