import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { FileText } from "lucide-react";

export default function IngestionsPage() {
  return (
    <div className="px-12 py-8">
      <PageHeader
        title="Ingestions"
        description="View and manage your PDF ingestions"
      />

      <EmptyStateCard
        icon={FileText}
        title="Coming soon"
        description="This section is under construction."
      />
    </div>
  );
}
