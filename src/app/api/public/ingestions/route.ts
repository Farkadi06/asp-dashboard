import { NextResponse } from "next/server";
import { getServerAspClient } from "@/lib/api/server-client";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const bankConnectionId = url.searchParams.get("bankConnectionId");

    if (!bankConnectionId) {
      return NextResponse.json(
        { error: "MISSING_BANK_CONNECTION_ID" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "MISSING_FILE" },
        { status: 400 }
      );
    }

    const client = await getServerAspClient();

    // Forward multipart/form-data without modification
    const backendResponse = await client.postFormData(
      `/ingestions?bankConnectionId=${bankConnectionId}`,
      formData
    );

    return NextResponse.json(backendResponse, { status: 200 });
  } catch (err: any) {
    console.error("Failed to create ingestion:", err);
    const status = err.status || 500;
    const data = err.data || { error: "INGESTION_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

export async function GET() {
  try {
    const client = await getServerAspClient();
    const data = await client.get("/ingestions");
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch ingestions:", err);
    const status = err.status || 500;
    const data = err.data || { error: "FETCH_INGESTIONS_FAILED", message: String(err) };
    return NextResponse.json(data, { status });
  }
}

