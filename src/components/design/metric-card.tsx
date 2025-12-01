import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  className,
  trend,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-neutral-900 shadow-md rounded-lg p-5 border border-[#1E1E1E] transition-all duration-300",
        "hover:scale-[1.02] hover:border-[#22D3EE]/20",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          {Icon && (
            <Icon className="w-5 h-5 text-[#22D3EE]/60" />
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-400" : "text-red-400"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

