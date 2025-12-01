import { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarSection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

