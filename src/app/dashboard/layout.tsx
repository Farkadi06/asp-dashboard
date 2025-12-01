"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authStore } from "@/lib/auth-store";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // For Step 2 (UI-only): Auto-set placeholder token in development
    // This allows testing the UI without backend authentication
    if (typeof window !== "undefined" && !authStore.isAuthenticated()) {
      // Check if we're in development mode (Next.js sets this)
      const isDev = process.env.NODE_ENV === "development";
      if (isDev) {
        authStore.setToken("dev-placeholder-token-step-2");
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  return <DashboardShell>{children}</DashboardShell>;
}
