"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  // Placeholder data - will be replaced with real data in Step 4
  const userName = "Itsfaou";
  const tenantName = "ASP Tenant";

  return (
    <header className="fixed top-0 left-64 right-0 z-30 bg-white border-b border-gray-200 h-14 transition-all duration-300">
      <div className="flex h-full items-center justify-end px-6">
        {/* Right side - User info only */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Avatar */}
          <Avatar className="h-8 w-8 border border-gray-200">
            <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User name */}
          <span className="text-sm font-medium text-gray-900">{userName}</span>

          {/* Tenant name */}
          <span className="text-sm text-gray-600">{tenantName}</span>
        </div>
      </div>
    </header>
  );
}
