# ASP Platform API Integration Guide

This guide shows how to integrate the ASP Platform API into the Next.js dashboard.

## Setup

The API client and React Query hooks are already set up. Import them from:

```typescript
import { useBanks, useCreateIngestion, useIngestion } from "@/lib/api";
import { getAspClient } from "@/lib/api";
```

## API Client Configuration

The API client automatically:
- Loads API key from localStorage (first available key)
- Uses base URL from `NEXT_PUBLIC_API_BASE_URL` or defaults to:
  - Production: `https://api.asp-platform.com/v1`
  - Development: `http://localhost:8080/v1`

## Key Integrations

### 1. Institution Browser (GET /banks)

**File:** `src/components/dashboard/sandbox/InstitutionBrowser.tsx`

```typescript
import { useBanks } from "@/lib/api";

const { data: banks = [], isLoading, error } = useBanks();
```

**Note:** Updated to use `bank.id` instead of `bank.code` for selection.

### 2. Sandbox Ingestion Flow

**File:** `src/app/dashboard/sandbox/page.tsx`

```typescript
import { useCreateIngestion, useIngestion, useCreateBankConnection } from "@/lib/api";

// Create bank connection first
const createConnection = useCreateBankConnection();
const connection = await createConnection.mutateAsync({
  bankId: selectedBankId,
  request: { userRef: "user_123" }
});

// Then create ingestion
const createIngestion = useCreateIngestion();
const ingestion = await createIngestion.mutateAsync({
  file: pdfFile,
  bankConnectionId: connection.connectionId
});

// Poll for status updates
const { data: ingestionStatus } = useIngestion(ingestion.id);
```

### 3. API Explorer

**File:** `src/components/api-explorer/EndpointRunner.tsx`

The API Explorer should use `getAspClient()` directly:

```typescript
import { getAspClient } from "@/lib/api";

const client = getAspClient(apiKey);
const result = await client.createIngestion(file, bankConnectionId);
```

### 4. API Keys Page

**File:** `src/app/dashboard/api-keys/page.tsx`

```typescript
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/lib/api";

const { data: keys = [] } = useApiKeys();
const createKey = useCreateApiKey();
const deleteKey = useDeleteApiKey();

// Create key
await createKey.mutateAsync({
  tenantId: "your-tenant-id",
  displayName: "My API Key",
  scopes: ["ingestions:write", "accounts:read"],
  sandbox: false
});

// Delete key
await deleteKey.mutateAsync(keyId);
```

### 5. Ingestion Detail Page

**File:** `src/app/dashboard/ingestions/[id]/page.tsx`

```typescript
import { useIngestion, useAccountTransactions } from "@/lib/api";

const { data: ingestion } = useIngestion(id);
const { data: transactions } = useAccountTransactions(accountId);
```

## Error Handling

All API errors are normalized to `AspApiError`:

```typescript
import { AspApiError } from "@/lib/api";

try {
  await client.createIngestion(file, connectionId);
} catch (error) {
  if (error instanceof AspApiError) {
    console.error(error.code, error.message);
    // Handle specific error codes
    if (error.code === "invalid_api_key") {
      // Redirect to login or show error
    }
  }
}
```

## Type Safety

All types are exported from `@/lib/api`:

```typescript
import type { Ingestion, Bank, ApiKey, Transaction } from "@/lib/api";
```

## Migration Notes

1. **Bank Selection:** Changed from `bankCode` (string) to `bankId` (UUID)
2. **Bank Connections:** Must create connection before ingestion
3. **API Keys:** Now stored on backend, not just localStorage
4. **Transactions:** Fetched via account ID, not ingestion ID

## Environment Variables

Add to `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/v1
```

For production, set to:
```
NEXT_PUBLIC_API_BASE_URL=https://api.asp-platform.com/v1
```

