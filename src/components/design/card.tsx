import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6",
        className
      )}
    >
      {children}
    </div>
  );
}
