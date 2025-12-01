"use client";

import Link from "next/link";
import { Check } from "lucide-react";

interface StepItemProps {
  completed: boolean;
  title: string;
  description: string;
  href: string;
}

export function StepItem({
  completed,
  title,
  description,
  href,
}: StepItemProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* Status Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {completed ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <div className="w-4 h-4 border border-gray-400 rounded-full flex-none" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

