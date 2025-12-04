/**
 * Next.js API Route: GET /api/public/banks
 * 
 * Proxies the ASP Platform /v1/banks endpoint.
 * API key is read from server-side environment variables only.
 */

import { getServerAspClient } from "@/lib/api/server-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if API key is configured
    const apiKey = process.env.ASP_API_KEY;
    if (!apiKey) {
      console.error("[API /banks] Missing ASP_API_KEY environment variable");
      return NextResponse.json(
        {
          error: "API key not configured",
          message: "Please set ASP_API_KEY in your .env.local file",
        },
        { status: 500 }
      );
    }

    const client = getServerAspClient();
    const banks = await client.getBanks();

    return NextResponse.json(banks);
  } catch (error: any) {
    // Handle errors
    const status = error.status || 500;
    const statusText = error.statusText || "Internal Server Error";
    const data = error.data || { error: "An unexpected error occurred" };

    // Log error for debugging (server-side only)
    console.error("[API /banks] Error:", {
      status,
      statusText,
      data,
      hasApiKey: !!process.env.ASP_API_KEY,
      baseUrl: process.env.ASP_API_BASE_URL,
      errorMessage: error.message,
    });

    return NextResponse.json(data, {
      status,
      statusText,
    });
  }
}

