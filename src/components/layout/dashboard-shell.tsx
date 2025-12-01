"use client";

import { Sidebar } from "@/components/dashboard/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-12 py-8">
        {children}
      </main>
    </div>
  );
}
