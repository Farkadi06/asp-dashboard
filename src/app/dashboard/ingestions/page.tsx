import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { FileText } from "lucide-react";

export default function IngestionsPage() {
  return (
    <>
      <PageHeader
        title="Ingestions"
        description="View and manage your PDF ingestions"
      />

      <EmptyStateCard
        icon={FileText}
        title="Coming soon"
        description="This section is under construction."
      />
    </>
  );
}
