"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "not-started" | "coming-soon";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
}

const steps: OnboardingStep[] = [
  {
    id: "verify-email",
    title: "Verify Email",
    description: "Confirm your email address to secure your account",
    status: "completed",
  },
  {
    id: "create-api-key",
    title: "Create API Key",
    description: "Generate your first API key to start making requests",
    status: "not-started",
  },
  {
    id: "upload-pdf",
    title: "Upload your first PDF",
    description: "Test the ingestion pipeline with a sample document",
    status: "not-started",
  },
  {
    id: "configure-webhook",
    title: "Configure Webhook",
    description: "Set up webhooks to receive real-time updates",
    status: "coming-soon",
  },
];

export function OnboardingProgressCard() {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const totalCount = steps.filter((s) => s.status !== "coming-soon").length;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Get production ready
            </CardTitle>
            <p className="text-sm text-[#6B7280] mt-1">
              {completedCount} of {totalCount} steps completed
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="divide-y divide-gray-100">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "py-4 flex items-start gap-4",
                index === 0 && "pt-6",
                index === steps.length - 1 && "pb-6"
              )}
            >
              {/* Icon */}
              <div className="mt-0.5">
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] mt-1">
                      {step.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        step.status === "completed" &&
                          "border-green-200 bg-green-50 text-green-700",
                        step.status === "not-started" &&
                          "border-gray-200 bg-gray-50 text-gray-700",
                        step.status === "coming-soon" &&
                          "border-gray-200 bg-gray-50 text-gray-500"
                      )}
                    >
                      {step.status === "completed" && "Completed"}
                      {step.status === "not-started" && "Not started"}
                      {step.status === "coming-soon" && "Coming soon"}
                    </Badge>

                    {/* Action Button */}
                    {step.status === "not-started" && (
                      <Button variant="outline" size="sm" className="h-8">
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

