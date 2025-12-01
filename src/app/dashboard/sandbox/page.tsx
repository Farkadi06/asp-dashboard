import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { FlaskConical } from "lucide-react";

export default function SandboxPage() {
  return (
    <>
      <PageHeader
        title="Sandbox"
        description="Test PDF processing in the sandbox environment"
      />

      <EmptyStateCard
        icon={FlaskConical}
        title="Coming soon"
        description="This section is under construction."
      />
    </>
  );
}
