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
  Pin,
  Package,
  Layers,
  Wrench,
  CircleHelp,
} from "lucide-react";
import { SidebarSection } from "@/lib/types/navigation";

/**
 * Sidebar configuration
 * 
 * To hide items temporarily, set `enabled: false` instead of removing them.
 * This makes it easy to re-enable later.
 */

// All available sidebar items (some disabled)
const allSidebarItems = {
  // PINNED
  home: { name: "Home", href: "/dashboard", icon: Home, enabled: true },
  notifications: { name: "Notifications", href: "/dashboard/notifications", icon: Bell, enabled: false },
  productionAccess: { name: "Get Production Access", href: "/dashboard/production-access", icon: Shield, enabled: false },
  
  // PRODUCTS
  ingestions: { name: "Ingestions", href: "/dashboard/ingestions", icon: FileText, enabled: true },
  transactions: { name: "Transactions", href: "/dashboard/transactions", icon: Receipt, enabled: false },
  apiKeys: { name: "API Keys", href: "/dashboard/api-keys", icon: Key, enabled: true },
  webhooks: { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook, enabled: false },
  connections: { name: "Connections", href: "/dashboard/connections", icon: Link2, enabled: false },
  
  // PLATFORM
  activity: { name: "Activity", href: "/dashboard/activity", icon: Activity, enabled: false },
  apiExplorer: { name: "API Explorer", href: "/dashboard/api-explorer", icon: Code, enabled: true },
  sdks: { name: "SDKs", href: "/dashboard/sdks", icon: Code, enabled: false },
  docs: { name: "Docs", href: "/dashboard/docs", icon: BookOpen, enabled: true },
  sandbox: { name: "Sandbox", href: "/dashboard/sandbox", icon: FlaskConical, enabled: true },
  
  // SETTINGS
  tenantSettings: { name: "Tenant Settings", href: "/dashboard/settings/tenant", icon: Settings, enabled: false },
  userProfile: { name: "User Profile", href: "/dashboard/settings/profile", icon: User, enabled: false },
  
  // HELP
  support: { name: "Support", href: "/dashboard/support", icon: HelpCircle, enabled: false },
  tutorials: { name: "Tutorials", href: "/dashboard/tutorials", icon: GraduationCap, enabled: false },
  helpDocs: { name: "Docs", href: "/dashboard/help-docs", icon: FileQuestion, enabled: false },
};

// Helper to filter enabled items
const getEnabledItems = (...keys: (keyof typeof allSidebarItems)[]) => {
  return keys
    .filter(key => allSidebarItems[key].enabled)
    .map(key => {
      const { enabled, ...item } = allSidebarItems[key];
      return item;
    });
};

export const sidebarConfig: SidebarSection[] = [
  {
    title: "PINNED",
    icon: Pin,
    items: getEnabledItems("home", "notifications", "productionAccess"),
  },
  {
    title: "PRODUCTS",
    icon: Package,
    items: getEnabledItems("ingestions", "transactions", "apiKeys", "webhooks", "connections"),
  },
  {
    title: "PLATFORM",
    icon: Layers,
    items: getEnabledItems("activity", "apiExplorer", "sdks", "sandbox"),
  },
  // SETTINGS section is completely hidden for now
  // {
  //   title: "SETTINGS",
  //   icon: Wrench,
  //   items: getEnabledItems("tenantSettings", "userProfile"),
  // },
  {
    title: "HELP",
    icon: CircleHelp,
    items: getEnabledItems("support", "tutorials", "helpDocs", "docs"),
  },
].filter(section => section.items.length > 0); // Only show sections with at least one enabled item

