import { redirect } from "next/navigation";
import { fetchSession, fetchTenantMe, type TenantMeResponse } from "@/lib/api/dashboard-client";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Force dynamic rendering - dashboard requires authentication
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check session authentication
  const session = await fetchSession();

  // Redirect to login if not authenticated
  if (!session.authenticated) {
    redirect("/login");
  }

  // Optionally fetch tenant info (don't fail if null)
  const tenant = await fetchTenantMe();

  // Render dashboard layout
  return <DashboardShell>{children}</DashboardShell>;
}
