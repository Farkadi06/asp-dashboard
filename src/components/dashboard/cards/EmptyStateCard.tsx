import { LucideIcon } from "lucide-react";
import { Card } from "@/components/design/card";
import { EmptyState } from "@/components/design/empty-state";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <Card>
      <EmptyState icon={icon} title={title} description={description} />
    </Card>
  );
}

