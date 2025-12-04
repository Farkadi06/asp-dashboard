"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepItem } from "./StepItem";

interface OnboardingCardProps {
  hasApiKey: boolean;
  isLoadingApiKey: boolean;
  ingestionCount: number;
}

export function OnboardingCard({
  hasApiKey,
  isLoadingApiKey,
  ingestionCount,
}: OnboardingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    {
      completed: hasApiKey,
      isLoading: isLoadingApiKey,
      title: "Create your first API Key",
      description: "Generate a secret key to start calling the ASP APIs.",
      href: "/dashboard/api-keys/access",
    },
    {
      completed: ingestionCount > 0,
      title: "Run your first ingestion",
      description: "Upload a sample PDF to see parsing and enrichment.",
      href: "/dashboard/sandbox",
    },
    {
      completed: false,
      title: "Configure your webhook",
      description: "Receive ingestion events automatically.",
      href: "/dashboard/webhooks",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <h2 className="text-lg font-medium text-gray-900">
          Let's get you started
        </h2>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {steps.map((step, index) => (
            <StepItem
              key={index}
              completed={step.completed}
              isLoading={step.isLoading}
              title={step.title}
              description={step.description}
              href={step.href}
            />
          ))}
        </div>
      )}
    </div>
  );
}

