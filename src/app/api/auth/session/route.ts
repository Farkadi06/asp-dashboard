import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ASP_CORE_URL = process.env.NEXT_PUBLIC_ASP_CORE_URL ?? "http://localhost:8080";

export async function GET() {
  const cookieStore = await cookies();
  const aspSession = cookieStore.get("asp_session")?.value;

  if (!aspSession) {
    return NextResponse.json({ authenticated: false });
  }

  const backendRes = await fetch(`${ASP_CORE_URL}/auth/session/me`, {
    headers: {
      Cookie: `asp_session=${aspSession}`,
    },
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json({ authenticated: false });
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}

