import { LucideIcon } from "lucide-react";
import { Card } from "@/components/design/card";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  action,
  className,
}: ActionCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 mb-3">{description}</p>
          )}
          {action && (
            <a
              href={action.href}
              className="inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              {action.label} ›
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

