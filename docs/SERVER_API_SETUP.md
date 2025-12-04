# Server-Side API Setup

This document describes the server-side API proxy infrastructure for securely calling the ASP Platform API.

## Architecture

```
Frontend (Browser)
    ↓
Next.js API Route (/api/public/*)
    ↓
Server-Side Client (reads API key from env)
    ↓
ASP Platform Public API
```

## Environment Variables

Add to `.env.local`:

```bash
# ASP Platform API Configuration
ASP_API_BASE_URL=http://localhost:8080/v1  # or https://api.asp-platform.com/v1 for production
ASP_API_KEY=asp_live_sk_abc123xyz_...      # Your API key (NEVER expose to browser)
```

## Usage

### From Frontend (Browser)

```typescript
import { ping } from "@/lib/api/public-client";

// Call the ping endpoint via Next.js API route
const result = await ping();
console.log(result.status); // "ok"
console.log(result.tenantId); // UUID or null
```

### From Server-Side (API Routes)

```typescript
import { getServerAspClient } from "@/lib/api/server-client";

// In a Next.js API route
const client = getServerAspClient();
const result = await client.ping();
```

## Security

- ✅ API key is **never** exposed to the browser
- ✅ API key is read **only** from server-side environment variables
- ✅ All requests go through Next.js API routes (server-side)
- ✅ Frontend calls `/api/public/*` routes, not the ASP API directly

## Extending

To add more endpoints:

1. Add method to `AspServerClient` in `src/lib/api/server-client.ts`
2. Create Next.js API route in `src/app/api/public/{endpoint}/route.ts`
3. Add frontend helper in `src/lib/api/public-client.ts`

Example:

```typescript
// server-client.ts
async getBanks() {
  return this.request<Bank[]>("/v1/banks");
}

// app/api/public/banks/route.ts
export async function GET() {
  const client = getServerAspClient();
  const banks = await client.getBanks();
  return NextResponse.json(banks);
}

// public-client.ts
export async function getBanks(): Promise<Bank[]> {
  const response = await fetch("/api/public/banks");
  return response.json();
}
```

