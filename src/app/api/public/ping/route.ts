/**
 * Next.js API Route: GET /api/public/ping
 * 
 * Proxies the ASP Platform /v1/ping endpoint.
 * API key is read from server-side environment variables only.
 */

import { getServerAspClient } from "@/lib/api/server-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = getServerAspClient();
    const result = await client.ping();

    return NextResponse.json(result);
  } catch (error: any) {
    // Handle errors
    const status = error.status || 500;
    const statusText = error.statusText || "Internal Server Error";
    const data = error.data || { error: "An unexpected error occurred" };

    return NextResponse.json(data, {
      status,
      statusText,
    });
  }
}

