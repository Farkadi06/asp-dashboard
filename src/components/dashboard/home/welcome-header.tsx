export function WelcomeHeader() {
  // Placeholder data - will be replaced with real data in Step 4
  const tenantName = "Placeholder Tenant";

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Hi, {tenantName}. Welcome to ASP Platform.
      </h1>
      <p className="text-sm text-[#6B7280]">
        Get started by completing the steps below to make your account production ready.
      </p>
    </div>
  );
}

