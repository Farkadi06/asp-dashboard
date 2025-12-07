import { redirect } from "next/navigation";
import { fetchSession, fetchTenantMe } from "@/lib/api/dashboard-client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check session authentication (runs server-side now)
  const session = await fetchSession();

  if (!session.authenticated) {
    redirect("/login");
  }

  const tenant = await fetchTenantMe();

  const initialSession = {
    authenticated: session.authenticated,
    email: session.email,
    tenant: tenant
      ? { name: tenant.name, slug: tenant.slug }
      : null,
  };

  return (
    <SessionProvider initialSession={initialSession}>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
