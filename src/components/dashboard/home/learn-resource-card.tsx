import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearnResourceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  ctaText?: string;
  className?: string;
}

export function LearnResourceCard({
  icon: Icon,
  title,
  description,
  href,
  ctaText = "Get started",
  className,
}: LearnResourceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block bg-white border border-gray-200 rounded-xl p-6 transition-all",
        "hover:border-gray-300 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="bg-blue-50 rounded-full h-8 w-8 flex items-center justify-center">
            <Icon className="h-4 w-4 text-[#2563EB]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-[#6B7280] mb-4">{description}</p>

          {/* CTA */}
          <div className="flex items-center gap-1 text-sm font-medium text-[#2563EB] group-hover:gap-2 transition-all">
            <span>{ctaText}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

