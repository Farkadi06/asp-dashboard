"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { OnboardingCard } from "@/components/dashboard/onboarding";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { LayoutDashboard } from "lucide-react";
import { getIngestionCount } from "@/lib/utils/sandbox";
import { getApiKeyMetadata } from "@/lib/api/public-client";

export default function DashboardPage() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [ingestionCount, setIngestionCount] = useState(0);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);

  // Load API key status from API
  useEffect(() => {
    async function checkApiKey() {
      try {
        await getApiKeyMetadata();
        setHasApiKey(true);
      } catch (err) {
        // API key doesn't exist or error
        setHasApiKey(false);
      } finally {
        setIsLoadingApiKey(false);
      }
    }

    checkApiKey();
    // Load ingestion count
    setIngestionCount(getIngestionCount());

    // Listen for ingestion changes
    const handleIngestionsChanged = (e: CustomEvent<number>) => {
      setIngestionCount(e.detail);
    };

    window.addEventListener("ingestionsChanged", handleIngestionsChanged as EventListener);
    return () => {
      window.removeEventListener("ingestionsChanged", handleIngestionsChanged as EventListener);
    };
  }, []);

  return (
    <div className="px-12 py-8">
      <PageHeader title="Dashboard" />

      <OnboardingCard
        hasApiKey={hasApiKey}
        isLoadingApiKey={isLoadingApiKey}
        ingestionCount={ingestionCount}
      />

      <EmptyStateCard
        icon={LayoutDashboard}
        title="Coming soon"
        description="This section is under construction."
      />
    </div>
  );
}
