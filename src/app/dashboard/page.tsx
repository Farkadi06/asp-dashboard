"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { OnboardingCard } from "@/components/dashboard/onboarding";
import { EmptyStateCard } from "@/components/dashboard/cards/EmptyStateCard";
import { LayoutDashboard } from "lucide-react";
import { ApiKey } from "@/lib/utils/api-keys";

const STORAGE_KEY = "asp_api_keys";

export default function DashboardPage() {
  const [apiKeyCount, setApiKeyCount] = useState(0);
  const ingestionCount = 0; // Will be implemented later

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
    };

    // Listen for custom event (same tab updates)
    const handleApiKeysChanged = (e: CustomEvent<ApiKey[]>) => {
      setApiKeyCount(e.detail.length);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("apiKeysChanged", handleApiKeysChanged as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apiKeysChanged", handleApiKeysChanged as EventListener);
    };
  }, []);

  return (
    <>
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
    </>
  );
}
