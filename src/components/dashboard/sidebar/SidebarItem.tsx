"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavItem } from "@/lib/types/navigation";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
}

export function SidebarItem({ item, isActive, isExpanded }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-2 text-sm h-[32px] px-3 rounded-md transition-colors",
        isActive
          ? "bg-gray-100 text-blue-600 font-medium"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {/* Blue left accent bar – flush with sidebar edge */}
      {isActive && (
        <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-600 rounded-r-md" />
      )}

      <Icon className="w-4 h-4 flex-shrink-0" />

      {isExpanded && <span>{item.name}</span>}
    </Link>
  );
}

