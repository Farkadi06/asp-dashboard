import { NextResponse } from "next/server";
import { fetchSession } from "@/lib/api/dashboard-client";

/**
 * OAuth Callback Route Handler
 * 
 * This route is called by asp-core after Google OAuth completes.
 * The session cookie (asp_session) is already set by asp-core.
 * 
 * Behavior:
 * 1. Verify session using fetchSession()
 * 2. If authenticated → redirect to /dashboard
 * 3. If not authenticated → redirect to /login?error=session
 */
export async function GET() {
  try {
    // Verify that the session exists and is valid
    const session = await fetchSession();

    // Get the app URL from environment variable (fallback to localhost for dev)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7000";

    if (session.authenticated) {
      // Session is valid, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", appUrl));
    }

    // Session is not valid, redirect to login with error
    return NextResponse.redirect(new URL("/login?error=session", appUrl));
  } catch (error) {
    // On any error, redirect to login with error
    console.error("[AuthCallback] Error during callback:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7000";
    return NextResponse.redirect(new URL("/login?error=session", appUrl));
  }
}

