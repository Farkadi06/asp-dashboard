"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar/SidebarContext";

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardShellProps) {
  const { sidebarWidth } = useSidebar();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Fixed Sidebar */}
      <aside 
        className="fixed inset-y-0 left-0 border-r border-gray-200 bg-white z-50" 
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar />
      </aside>
      
      {/* Scrollable Main Content - margin-left adjusts based on sidebar width */}
      <main 
        className="flex-1 overflow-y-auto bg-gray-50 h-full"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {children}
      </main>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
