"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarConfig } from "@/lib/config/sidebar-config";
import { SidebarGroup } from "./SidebarGroup";
import { useSidebar } from "./SidebarContext";

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, setIsExpanded } = useSidebar();
  const [openSection, setOpenSection] = useState<string | null>("PINNED");
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navRef = useRef<HTMLElement>(null);

  // Automatically open the section containing the active item
  useEffect(() => {
    for (const section of sidebarConfig) {
      const hasActiveItem = section.items.some((item) => pathname === item.href);
      if (hasActiveItem) {
        setOpenSection(section.title);
        break;
      }
    }
  }, [pathname]);

  // Toggle section - accordion behavior: only one section open at a time
  const toggleSection = (title: string) => {
    if (openSection === title) {
      setOpenSection(null);
    } else {
      setOpenSection(title);
    }
  };

  // Handle section icon click when collapsed: expand sidebar, open section, and scroll to it
  const handleSectionIconClick = (title: string) => {
    setIsExpanded(true);
    setOpenSection(title);
    // Use setTimeout to ensure sidebar has expanded before scrolling
    setTimeout(() => {
      const sectionElement = sectionRefs.current[title];
      if (sectionElement && navRef.current) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        // Add a temporary highlight effect
        sectionElement.style.transition = "background-color 0.2s";
        sectionElement.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
        setTimeout(() => {
          if (sectionElement) {
            sectionElement.style.backgroundColor = "";
          }
        }, 1000);
      }
    }, 100);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 h-screen border-r bg-white border-[rgba(0,0,0,0.08)] transition-all duration-200",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className="h-full flex flex-col">
        {/* Logo and Collapse Button */}
        <div className="p-4 border-b border-[rgba(0,0,0,0.08)]">
          {isExpanded ? (
            <div className="flex items-center justify-between">
              {/* Logo only - no text label */}
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">ASP</span>
              </div>
              {/* Collapse Button */}
              <button
                onClick={() => {
                  setIsExpanded(false);
                }}
                className="group p-1.5 rounded-md hover:bg-blue-50 transition-colors flex-shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          ) : (
            /* When collapsed: only button centered, no logo */
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setIsExpanded(true);
                  if (!openSection) {
                    setOpenSection("PINNED");
                  }
                }}
                className="group p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav ref={navRef} className="flex-1 overflow-y-auto py-2">
          <div className={!isExpanded ? "px-2 space-y-1" : ""}>
            {sidebarConfig.map((section) => (
              <SidebarGroup
                key={section.title}
                section={section}
                isExpanded={isExpanded}
                isOpen={openSection === section.title}
                onToggle={() => toggleSection(section.title)}
                onIconClick={() => handleSectionIconClick(section.title)}
                sectionRef={(el) => {
                  sectionRefs.current[section.title] = el;
                }}
              />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}

