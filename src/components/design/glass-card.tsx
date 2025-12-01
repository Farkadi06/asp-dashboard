import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-neutral-900 shadow-md rounded-xl p-6 border border-[#1E1E1E]",
        "transition-all duration-300",
        "hover:bg-neutral-800",
        className
      )}
    >
      {children}
    </div>
  );
}

