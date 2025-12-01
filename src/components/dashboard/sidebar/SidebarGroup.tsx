"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarSection } from "@/lib/types/navigation";
import { SidebarItem } from "./SidebarItem";

interface SidebarGroupProps {
  section: SidebarSection;
  isExpanded: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onIconClick: () => void;
  sectionRef: (el: HTMLDivElement | null) => void;
}

export function SidebarGroup({
  section,
  isExpanded,
  isOpen,
  onToggle,
  onIconClick,
  sectionRef,
}: SidebarGroupProps) {
  const pathname = usePathname();
  const { title, icon: SectionIcon, items } = section;

  // Check if any item in this section is active
  const hasActiveItem = items.some((item) => pathname === item.href);

  // When collapsed, show only the section icon
  if (!isExpanded) {
    return (
      <button
        onClick={onIconClick}
        className={cn(
          "group relative w-full flex items-center justify-center h-[36px] px-2 rounded-md transition-colors mb-1 cursor-pointer",
          hasActiveItem ? "bg-gray-100" : "hover:bg-blue-50"
        )}
        title={title}
      >
        {/* Blue left accent bar - same as expanded active state */}
        {hasActiveItem && (
          <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-600 rounded-r-md" />
        )}
        <SectionIcon
          className={cn(
            "w-4 h-4 relative z-10 transition-colors",
            hasActiveItem
              ? "text-blue-600"
              : "text-gray-600 group-hover:text-blue-600"
          )}
        />
      </button>
    );
  }

  // When expanded, show accordion section
  return (
    <div ref={sectionRef} className="mb-2">
      {/* Section Header - Clickable to toggle */}
      <button
        onClick={onToggle}
        className="group section-header w-full flex items-center justify-between text-left text-[10px] uppercase font-semibold text-gray-500 px-3 mt-4 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-all duration-200",
            isOpen && "rotate-180",
            "group-hover:text-blue-600"
          )}
        />
      </button>
      {/* Section Items - Only visible when section is open */}
      {isOpen && (
        <div className="px-2">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

