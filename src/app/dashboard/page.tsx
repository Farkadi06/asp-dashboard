"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { OnboardingCard } from "@/components/dashboard/onboarding";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { LayoutDashboard } from "lucide-react";
import { ApiKey } from "@/lib/utils/api-keys";
import { Ingestion } from "@/lib/types/ingestion";
import { getIngestionCount } from "@/lib/utils/sandbox";

const STORAGE_KEY = "asp_api_keys";
const INGESTION_STORAGE_KEY = "asp_mock_ingestions";

export default function DashboardPage() {
  const [apiKeyCount, setApiKeyCount] = useState(0);
  const [ingestionCount, setIngestionCount] = useState(0);

  // Load API key count from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const keys: ApiKey[] = JSON.parse(stored);
          setApiKeyCount(keys.length);
        } catch (e) {
          console.error("Failed to parse stored API keys", e);
        }
      }

      // Load ingestion count
      setIngestionCount(getIngestionCount());
    }

    // Listen for storage changes (when keys are added/removed on other tabs)
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const keys: ApiKey[] = JSON.parse(stored);
          setApiKeyCount(keys.length);
        } catch (e) {
          // Ignore errors
        }
      } else {
        setApiKeyCount(0);
      }

      // Update ingestion count
      setIngestionCount(getIngestionCount());
    };

    // Listen for custom event (same tab updates)
    const handleApiKeysChanged = (e: CustomEvent<ApiKey[]>) => {
      setApiKeyCount(e.detail.length);
    };

    const handleIngestionsChanged = (e: CustomEvent<number>) => {
      setIngestionCount(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("apiKeysChanged", handleApiKeysChanged as EventListener);
    window.addEventListener("ingestionsChanged", handleIngestionsChanged as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apiKeysChanged", handleApiKeysChanged as EventListener);
      window.removeEventListener("ingestionsChanged", handleIngestionsChanged as EventListener);
    };
  }, []);

  return (
    <div className="px-12 py-8">
      <PageHeader title="Dashboard" />

      <OnboardingCard
        apiKeyCount={apiKeyCount}
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
