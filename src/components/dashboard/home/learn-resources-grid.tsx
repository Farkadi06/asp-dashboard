import {
  BookOpen,
  FileText,
  FlaskConical,
  Code,
  GraduationCap,
} from "lucide-react";
import { LearnResourceCard } from "./learn-resource-card";

const resources = [
  {
    icon: BookOpen,
    title: "Quickstart",
    description: "Get up and running in minutes with our step-by-step guide",
    href: "/dashboard/sandbox",
    ctaText: "Get started",
  },
  {
    icon: FileText,
    title: "Test Ingestion",
    description: "Upload a sample PDF to see how the pipeline works",
    href: "/dashboard/sandbox",
    ctaText: "Try it now",
  },
  {
    icon: FlaskConical,
    title: "Sandbox",
    description: "Test your integrations in a safe environment",
    href: "/dashboard/sandbox",
    ctaText: "Open sandbox",
  },
  {
    icon: Code,
    title: "API Docs",
    description: "Complete reference for all API endpoints and methods",
    href: "#",
    ctaText: "Open docs",
  },
  {
    icon: GraduationCap,
    title: "Guides",
    description: "Learn best practices and advanced integration patterns",
    href: "#",
    ctaText: "View guides",
  },
];

export function LearnResourcesGrid() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Learn how to build with ASP Platform
        </h2>
        <p className="text-sm text-[#6B7280]">
          Explore our resources to get the most out of the platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <LearnResourceCard
            key={resource.title}
            icon={resource.icon}
            title={resource.title}
            description={resource.description}
            href={resource.href}
            ctaText={resource.ctaText}
          />
        ))}
      </div>
    </div>
  );
}

