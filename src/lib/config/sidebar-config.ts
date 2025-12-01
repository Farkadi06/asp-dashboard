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

export const sidebarConfig: SidebarSection[] = [
  {
    title: "PINNED",
    icon: Pin,
    items: [
      { name: "Home", href: "/dashboard", icon: Home },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
      {
        name: "Get Production Access",
        href: "/dashboard/production-access",
        icon: Shield,
      },
    ],
  },
  {
    title: "PRODUCTS",
    icon: Package,
    items: [
      { name: "Ingestions", href: "/dashboard/ingestions", icon: FileText },
      { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
      { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
      { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { name: "Connections", href: "/dashboard/connections", icon: Link2 },
    ],
  },
  {
    title: "PLATFORM",
    icon: Layers,
    items: [
      { name: "Activity", href: "/dashboard/activity", icon: Activity },
      { name: "API Explorer", href: "/dashboard/api-explorer", icon: Code },
      { name: "SDKs", href: "/dashboard/sdks", icon: Code },
      { name: "Docs", href: "/dashboard/docs", icon: BookOpen },
      { name: "Sandbox", href: "/dashboard/sandbox", icon: FlaskConical },
    ],
  },
  {
    title: "SETTINGS",
    icon: Wrench,
    items: [
      {
        name: "Tenant Settings",
        href: "/dashboard/settings/tenant",
        icon: Settings,
      },
      { name: "User Profile", href: "/dashboard/settings/profile", icon: User },
    ],
  },
  {
    title: "HELP",
    icon: CircleHelp,
    items: [
      { name: "Support", href: "/dashboard/support", icon: HelpCircle },
      { name: "Tutorials", href: "/dashboard/tutorials", icon: GraduationCap },
      { name: "Docs", href: "/dashboard/help-docs", icon: FileQuestion },
    ],
  },
];

