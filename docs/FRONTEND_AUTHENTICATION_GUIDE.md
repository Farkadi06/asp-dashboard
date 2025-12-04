# Frontend Authentication & API Key Management Guide

## Overview

The ASP Platform uses **two separate authentication systems** for different use cases:

| System | Authentication Method | Endpoints | Use Case |
|--------|----------------------|-----------|----------|
| **Public API** | API Key (`X-Api-Key` header) | `/v1/**` | External developers, integrations, server-to-server |
| **Dashboard API** | Session Cookie (`asp_session`) | `/internal/**`, `/dashboard/**` | Web dashboard, user-facing features |

This separation follows industry best practices (similar to Stripe, Plaid, Tink) and ensures clear boundaries between developer-facing and user-facing functionality.

---

## Table of Contents

1. [Dashboard Authentication (Session-Based)](#dashboard-authentication-session-based)
2. [Public API Authentication (API Key-Based)](#public-api-authentication-api-key-based)
3. [API Key Management](#api-key-management)
4. [TypeScript Definitions](#typescript-definitions)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

---

## Dashboard Authentication (Session-Based)

### Overview

Dashboard authentication uses **session cookies** (`asp_session`) for user authentication. This is the standard web authentication pattern where users log in via Google OAuth and receive a secure session cookie.

### Authentication Flow

1. **User Login**: `POST /auth/google/login` → Redirects to Google OAuth
2. **OAuth Callback**: `GET /auth/google/callback` → Creates session, sets cookie
3. **Session Check**: `GET /auth/session/me` → Returns current user info
4. **Logout**: `POST /auth/logout` → Invalidates session, clears cookie

### Endpoints

#### Check Current Session

```http
GET /auth/session/me
```

**Authentication**: Session cookie (`asp_session`)

**Response**:
```json
{
  "authenticated": true,
  "email": "user@example.com",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Unauthenticated Response**:
```json
{
  "authenticated": false
}
```

#### Logout

```http
POST /auth/logout
```

**Authentication**: Session cookie (optional - idempotent)

**Response**:
```json
{
  "loggedOut": true
}
```

**Note**: This endpoint clears the session cookie and invalidates the session in the database.

### Session Cookie Details

- **Name**: `asp_session`
- **HttpOnly**: `true` (not accessible via JavaScript)
- **Secure**: `true` (HTTPS only)
- **SameSite**: `Strict`
- **Max-Age**: 14 days
- **Path**: `/`

### Frontend Implementation

```typescript
// Check if user is authenticated
async function checkAuth(): Promise<AuthResponse | null> {
  const response = await fetch('/auth/session/me', {
    credentials: 'include', // Important: include cookies
  });
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return data.authenticated ? data : null;
}

// Logout
async function logout(): Promise<void> {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include', // Important: include cookies
  });
  
  // Redirect to login page
  window.location.href = '/login';
}
```

---

## Public API Authentication (API Key-Based)

### Overview

Public API authentication uses **API keys** passed in the `X-Api-Key` header. This is designed for server-to-server communication, integrations, and programmatic access.

### API Key Format

```
asp_live_<prefix>_<secret>
asp_sandbox_<prefix>_<secret>
```

**Example**:
```
asp_live_abc12345_xYz789SecretKey12345678901234567890
```

### Authentication Header

```http
X-Api-Key: asp_live_abc12345_xYz789SecretKey12345678901234567890
```

### Endpoints

All `/v1/**` endpoints require API key authentication.

**Important**: 
- API keys are **tenant-scoped** - each key belongs to a specific tenant
- The tenant ID is **automatically resolved** from the API key
- You **cannot** specify a different tenant ID in requests

### Frontend Implementation (for Server-Side Only)

⚠️ **Security Warning**: API keys should **NEVER** be exposed in client-side JavaScript. They should only be used in:
- Server-side applications (Node.js backend, etc.)
- Mobile apps (with secure storage)
- Backend services

```typescript
// Server-side only (Node.js, etc.)
async function callPublicAPI(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.ASP_API_KEY; // From environment variable
  
  const response = await fetch(`https://api.asp-platform.com/v1${endpoint}`, {
    ...options,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
```

---

## API Key Management

### Overview

API keys can be managed through **two separate interfaces**:

1. **Dashboard UI** (`/internal/api-keys`) - For users managing their own keys
2. **Public API** (`/v1/api-keys`) - For programmatic key management

### Dashboard API Key Management (`/internal/api-keys`)

These endpoints are **session-authenticated** and are used by the dashboard UI.

#### List API Keys

```http
GET /internal/api-keys
```

**Authentication**: Session cookie

**Response**:
```json
[
  {
    "id": "ak_abc123xyz",
    "displayName": "Production API Key",
    "prefix": "sk_abc123xyz",
    "scopes": ["ingestions:write", "accounts:read"],
    "sandbox": false,
    "createdAt": "2025-11-29T10:00:00Z",
    "lastUsedAt": "2025-11-29T15:10:47Z"
  }
]
```

**Note**: The full API key secret is **never** returned in list responses.

#### Create API Key

```http
POST /internal/api-keys
Content-Type: application/json

{
  "displayName": "Production API Key",
  "scopes": ["ingestions:write", "accounts:read"],
  "sandbox": false
}
```

**Authentication**: Session cookie

**Response**:
```json
{
  "id": "ak_abc123xyz",
  "prefix": "sk_abc123xyz",
  "apiKey": "asp_live_sk_abc123xyz_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
}
```

⚠️ **Important**: The full API key (`apiKey` field) is shown **only once** in this response. Store it securely immediately. Subsequent calls to list API keys will only show the prefix.

#### Delete API Key

```http
DELETE /internal/api-keys/{id}
```

**Authentication**: Session cookie

**Response**:
```json
{
  "deleted": true
}
```

### Public API Key Management (`/v1/api-keys`)

These endpoints are **API key-authenticated** and are used for programmatic key management.

#### List API Keys

```http
GET /v1/api-keys
X-Api-Key: asp_live_abc12345_...
```

**Response**: Same format as dashboard API

#### Create API Key

```http
POST /v1/api-keys
X-Api-Key: asp_live_abc12345_...
Content-Type: application/json

{
  "displayName": "Production API Key",
  "scopes": ["ingestions:write", "accounts:read"],
  "sandbox": false
}
```

**Note**: The `tenantId` field in the request body is **deprecated** and ignored. The tenant ID is automatically derived from the authenticated API key.

**Response**: Same format as dashboard API

#### Delete API Key

```http
DELETE /v1/api-keys/{id}
X-Api-Key: asp_live_abc12345_...
```

**Response**: Same format as dashboard API

---

## TypeScript Definitions

### Authentication Types

```typescript
// Session Authentication
interface AuthResponse {
  authenticated: boolean;
  email?: string;
  userId?: string;
  tenantId?: string;
}

interface LogoutResponse {
  loggedOut: boolean;
}

// Tenant Information
interface TenantMeResponse {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}
```

### API Key Types

```typescript
// API Key Response (list)
interface ApiKeyResponse {
  id: string;
  displayName: string;
  prefix: string;
  scopes: string[];
  sandbox: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

// Create API Key Request (Dashboard)
interface InternalCreateApiKeyRequest {
  displayName: string;
  scopes: string[];
  sandbox?: boolean;
}

// Create API Key Request (Public API - deprecated tenantId)
interface CreateApiKeyRequest {
  tenantId?: string; // @deprecated - ignored, derived from API key
  displayName: string;
  scopes: string[];
  sandbox?: boolean;
}

// Create API Key Response
interface CreateApiKeyResponse {
  id: string;
  prefix: string;
  apiKey: string; // Full key - shown only once!
}

// Delete API Key Response
interface DeleteApiKeyResponse {
  deleted: boolean;
}
```

### Error Responses

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Common error codes:
// - "invalid_api_key" - API key is missing or invalid
// - "unauthorized" - Session expired or invalid
// - "forbidden" - Insufficient permissions
// - "not_found" - Resource not found
// - "validation_error" - Request validation failed
```

---

## Examples

### Dashboard: Complete Authentication Flow

```typescript
// 1. Check if user is logged in
async function checkAuth(): Promise<AuthResponse | null> {
  const response = await fetch('/auth/session/me', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    return null;
  }
  
  const data: AuthResponse = await response.json();
  return data.authenticated ? data : null;
}

// 2. Get tenant information
async function getTenant(): Promise<TenantMeResponse> {
  const response = await fetch('/internal/tenant/me', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get tenant info');
  }
  
  return response.json();
}

// 3. List API keys
async function listApiKeys(): Promise<ApiKeyResponse[]> {
  const response = await fetch('/internal/api-keys', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to list API keys');
  }
  
  return response.json();
}

// 4. Create API key
async function createApiKey(
  displayName: string,
  scopes: string[],
  sandbox: boolean = false
): Promise<CreateApiKeyResponse> {
  const response = await fetch('/internal/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      displayName,
      scopes,
      sandbox,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create API key');
  }
  
  const data: CreateApiKeyResponse = await response.json();
  
  // ⚠️ IMPORTANT: Store the full API key securely - it's shown only once!
  console.warn('Store this API key securely:', data.apiKey);
  
  return data;
}

// 5. Delete API key
async function deleteApiKey(id: string): Promise<void> {
  const response = await fetch(`/internal/api-keys/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete API key');
  }
}

// 6. Logout
async function logout(): Promise<void> {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  window.location.href = '/login';
}
```

### Public API: Server-Side Usage

```typescript
// Server-side only (Node.js backend)
class ASPPlatformClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.asp-platform.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}/v1${endpoint}`, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  // List API keys
  async listApiKeys(): Promise<ApiKeyResponse[]> {
    return this.request<ApiKeyResponse[]>('/api-keys');
  }

  // Create API key
  async createApiKey(
    displayName: string,
    scopes: string[],
    sandbox: boolean = false
  ): Promise<CreateApiKeyResponse> {
    return this.request<CreateApiKeyResponse>('/api-keys', {
      method: 'POST',
      body: JSON.stringify({
        displayName,
        scopes,
        sandbox,
        // Note: tenantId is deprecated and ignored
      }),
    });
  }

  // Delete API key
  async deleteApiKey(id: string): Promise<void> {
    await this.request(`/api-keys/${id}`, {
      method: 'DELETE',
    });
  }
}

// Usage
const client = new ASPPlatformClient(process.env.ASP_API_KEY!);
const keys = await client.listApiKeys();
```

---

## Best Practices

### Dashboard (Session-Based)

1. **Always include credentials**: Use `credentials: 'include'` in all fetch requests
2. **Check authentication**: Call `/auth/session/me` on app startup
3. **Handle expired sessions**: Redirect to login if `authenticated: false`
4. **Store API keys securely**: When creating API keys, store them in a secure location (not in localStorage)
5. **Never expose API keys**: API keys created via dashboard should be stored server-side

### Public API (API Key-Based)

1. **Never expose in client-side code**: API keys should only be used server-side
2. **Use environment variables**: Store API keys in environment variables, not in code
3. **Rotate keys regularly**: Implement key rotation policies
4. **Use sandbox keys for testing**: Use `sandbox: true` for development/testing
5. **Scope appropriately**: Only request the scopes you need

### Security Considerations

1. **HTTPS only**: All API calls must use HTTPS
2. **Secure storage**: Store API keys in secure vaults (AWS Secrets Manager, etc.)
3. **Key rotation**: Implement automated key rotation
4. **Monitor usage**: Track API key usage and revoke unused keys
5. **Least privilege**: Use the minimum required scopes

### Error Handling

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof Response) {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login';
        return null;
      }
      if (error.status === 403) {
        // Forbidden - show error message
        console.error('Access denied');
        return null;
      }
    }
    
    console.error('API call failed:', error);
    return null;
  }
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐              ┌──────────────────────┐
│  Dashboard Routes │              │   Public API Routes  │
│  /internal/**     │              │   /v1/**             │
│  /dashboard/**    │              │                       │
└───────────────────┘              └──────────────────────┘
        │                                       │
        │                                       │
        ▼                                       ▼
┌───────────────────┐              ┌──────────────────────┐
│ Session Auth      │              │ API Key Auth         │
│ (asp_session)     │              │ (X-Api-Key header)   │
│                   │              │                       │
│ UserPrincipal     │              │ TenantContext        │
│ (userId,          │              │ (tenantId from key)   │
│  tenantId, email) │              │                       │
└───────────────────┘              └──────────────────────┘
        │                                       │
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  ApiKeyManagementService│
                │  (Core Business Logic)  │
                └───────────────────────┘
```

---

## Migration Guide

### From Old API to New Structure

If you're migrating from an older version that used `tenantId` in request bodies:

1. **Dashboard API**: Remove `tenantId` from requests - it's automatically derived from session
2. **Public API**: Remove `tenantId` from requests - it's automatically derived from API key
3. **Update TypeScript types**: Use `InternalCreateApiKeyRequest` for dashboard, `CreateApiKeyRequest` for public API (but ignore `tenantId`)

### Deprecated Fields

- `CreateApiKeyRequest.tenantId` - **Deprecated**, will be removed in v2
  - **Action**: Remove from requests, tenant ID is derived from API key

---

## Support & Resources

- **API Documentation**: See `PUBLIC_API_REFERENCE.md` for full API documentation
- **Architecture Overview**: See `ARCHITECTURE_OVERVIEW.md` for system architecture
- **Error Codes**: See error response format above

---

## Summary

| Feature | Dashboard API | Public API |
|---------|--------------|------------|
| **Authentication** | Session cookie | API key header |
| **Endpoint Prefix** | `/internal/**` | `/v1/**` |
| **Tenant Resolution** | From session (UserPrincipal) | From API key (TenantContext) |
| **Use Case** | Web dashboard UI | Server-to-server, integrations |
| **Client-Side Safe** | ✅ Yes | ❌ No (server-side only) |
| **Key Management** | `/internal/api-keys` | `/v1/api-keys` |

**Key Takeaway**: Use **Dashboard API** for user-facing features, use **Public API** for integrations and server-to-server communication.

