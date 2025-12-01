"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import {
  Home,
  Bell,
  Shield,
  FileText,
  Receipt,
  Key,
  Webhook,
  Link2,
  Activity,
  Code,
  BookOpen,
  FlaskConical,
  Settings,
  User,
  HelpCircle,
  GraduationCap,
  FileQuestion,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Package,
  Layers,
  Wrench,
  CircleHelp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const pinnedItems: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  {
    name: "Get Production Access",
    href: "/dashboard/production-access",
    icon: Shield,
  },
];

const productsItems: NavItem[] = [
  { name: "Ingestions", href: "/dashboard/ingestions", icon: FileText },
  { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { name: "Connections", href: "/dashboard/connections", icon: Link2 },
];

const platformItems: NavItem[] = [
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "API Explorer", href: "/dashboard/api-explorer", icon: Code },
  { name: "SDKs", href: "/dashboard/sdks", icon: Code },
  { name: "Docs", href: "/dashboard/docs", icon: BookOpen },
  { name: "Sandbox", href: "/dashboard/sandbox", icon: FlaskConical },
];

const settingsItems: NavItem[] = [
  {
    name: "Tenant Settings",
    href: "/dashboard/settings/tenant",
    icon: Settings,
  },
  { name: "User Profile", href: "/dashboard/settings/profile", icon: User },
];

const helpItems: NavItem[] = [
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
  { name: "Tutorials", href: "/dashboard/tutorials", icon: GraduationCap },
  { name: "Docs", href: "/dashboard/help-docs", icon: FileQuestion },
];

interface SectionConfig {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const sections: SectionConfig[] = [
  { title: "PINNED", icon: Pin, items: pinnedItems },
  { title: "PRODUCTS", icon: Package, items: productsItems },
  { title: "PLATFORM", icon: Layers, items: platformItems },
  { title: "SETTINGS", icon: Wrench, items: settingsItems },
  { title: "HELP", icon: CircleHelp, items: helpItems },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>("PINNED");
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navRef = useRef<HTMLElement>(null);

  // Toggle section - accordion behavior: only one section open at a time
  const toggleSection = (title: string) => {
    if (openSection === title) {
      // If clicking the same section, close it
      setOpenSection(null);
    } else {
      // Open the clicked section (automatically closes the previously open one)
      setOpenSection(title);
    }
  };

  // Handle section icon click when collapsed: expand sidebar, open section, and scroll to it
  const handleSectionIconClick = (title: string) => {
    setIsExpanded(true);
    setOpenSection(title); // Open the section
    // Use setTimeout to ensure sidebar has expanded before scrolling
    setTimeout(() => {
      const sectionElement = sectionRefs.current[title];
      if (sectionElement && navRef.current) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add a temporary highlight effect
        sectionElement.style.transition = 'background-color 0.2s';
        sectionElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        setTimeout(() => {
          if (sectionElement) {
            sectionElement.style.backgroundColor = '';
          }
        }, 1000);
      }
    }, 100);
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
  
    return (
      <Link
        key={item.name}
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
  };
  
  const renderSection = (section: SectionConfig) => {
    const { title, icon: SectionIcon, items } = section;
    const isOpen = openSection === title;
    
    // Check if any item in this section is active
    const hasActiveItem = items.some(item => pathname === item.href);

    // When collapsed, show only the section icon
    if (!isExpanded) {
      return (
        <button
          key={title}
          onClick={() => handleSectionIconClick(title)}
          className={cn(
            "group relative w-full flex items-center justify-center h-[36px] px-2 rounded-md transition-colors mb-1 cursor-pointer",
            hasActiveItem
              ? "bg-gray-100"
              : "hover:bg-blue-50"
          )}
          title={title}
        >
          {/* Blue left accent bar - same as expanded active state */}
          {hasActiveItem && (
            <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-600 rounded-r-md" />
          )}
          <SectionIcon className={cn(
            "w-4 h-4 relative z-10 transition-colors",
            hasActiveItem 
              ? "text-blue-600" 
              : "text-gray-600 group-hover:text-blue-600"
          )} />
        </button>
      );
    }

    // When expanded, show accordion section
    return (
      <div
        key={title}
        ref={(el) => {
          sectionRefs.current[title] = el;
        }}
        className="mb-2"
      >
        {/* Section Header - Clickable to toggle */}
        <button
          onClick={() => toggleSection(title)}
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
            {items.map(renderNavItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-[rgba(0,0,0,0.08)] transition-all duration-300",
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
                  // When collapsing, keep openSection state for when we expand again
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
                  // When expanding, open PINNED by default if no section is open
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
            {sections.map(renderSection)}
          </div>
        </nav>
      </div>
    </aside>
  );
}
