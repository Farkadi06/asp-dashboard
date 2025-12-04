# ASP Platform - Dashboard API Reference

**Version:** 1.0  
**Base URL:** `http://localhost:8080` (Development) | `https://app.asp-platform.com` (Production)  
**Last Updated:** December 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Tenant Information](#tenant-information)
   - [API Key Management](#api-key-management)
4. [Data Models](#data-models)
5. [TypeScript Definitions](#typescript-definitions)
6. [Error Handling](#error-handling)

---

## Overview

The Dashboard API provides endpoints for the web dashboard UI. These endpoints use **session-based authentication** (cookies) and are **not** accessible via the public API.

### Key Characteristics

- **Authentication**: Session cookie (`asp_session`)
- **Endpoint Prefix**: `/internal/**`, `/auth/**`
- **Tenant Resolution**: Automatically derived from user session
- **Use Case**: Web dashboard, user-facing features
- **Client-Side Safe**: ✅ Yes (uses secure HttpOnly cookies)

### Important Notes

- **Never use API keys** with these endpoints
- **Always include credentials** (`credentials: 'include'` in fetch)
- **Session expires** after 14 days of inactivity
- **Tenant ID** is automatically derived from the logged-in user's session

---

## Authentication

### Session-Based Authentication

Dashboard authentication uses secure session cookies. Users log in via Google OAuth and receive a session cookie that is automatically included in subsequent requests.

### Session Cookie Details

- **Name**: `asp_session`
- **HttpOnly**: `true` (not accessible via JavaScript)
- **Secure**: `true` (HTTPS only)
- **SameSite**: `Strict`
- **Max-Age**: 14 days
- **Path**: `/`

### Authentication Flow

1. User clicks "Sign in with Google" → `GET /auth/google/login`
2. Google OAuth redirect → `GET /auth/google/callback`
3. Backend creates session, sets cookie
4. Frontend checks session → `GET /auth/session/me`
5. All subsequent requests include cookie automatically

### Frontend Implementation

```typescript
// All dashboard API calls must include credentials
const response = await fetch('/internal/api-keys', {
  credentials: 'include', // Important: include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## Endpoints

### Authentication Endpoints

#### Check Current Session

```http
GET /auth/session/me
```

**Authentication**: Session cookie (optional - returns `authenticated: false` if not logged in)

**Response:** `200 OK`

```json
{
  "authenticated": true,
  "email": "user@example.com",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Unauthenticated Response:**

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

**Response:** `200 OK`

```json
{
  "loggedOut": true
}
```

**Note**: This endpoint clears the session cookie and invalidates the session in the database.

---

### Tenant Information

#### Get Current Tenant

```http
GET /internal/tenant/me
```

**Authentication**: Session cookie (required)

**Response:** `200 OK`

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "John Doe",
  "slug": "john-doe",
  "status": "ACTIVE",
  "plan": "FREE",
  "createdAt": "2025-11-29T10:00:00Z",
  "updatedAt": "2025-11-29T10:00:00Z"
}
```

**Error Responses:**

**401 Unauthorized** - Not authenticated
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

---

### API Key Management

All API key management endpoints automatically use the tenant ID from the user's session. You **cannot** and **should not** specify a tenant ID in request bodies.

#### List API Keys

```http
GET /internal/api-keys
```

**Authentication**: Session cookie (required)

**Response:** `200 OK`

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
  },
  {
    "id": "ak_def456uvw",
    "displayName": "Sandbox API Key",
    "prefix": "sk_def456uvw",
    "scopes": ["ingestions:write", "accounts:read"],
    "sandbox": true,
    "createdAt": "2025-11-28T08:00:00Z",
    "lastUsedAt": null
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | API key identifier |
| `displayName` | String | Human-readable name |
| `prefix` | String | Key prefix (for identification) |
| `scopes` | Array[String] | Permissions |
| `sandbox` | Boolean | Whether this is a sandbox key |
| `createdAt` | String | Creation timestamp (ISO 8601) |
| `lastUsedAt` | String \| null | Last usage timestamp (ISO 8601) |

**Note:** The full API key secret is **never** returned in list responses for security reasons.

#### Create API Key

```http
POST /internal/api-keys
Content-Type: application/json
```

**Authentication**: Session cookie (required)

**Request Body:**

```json
{
  "displayName": "Production API Key",
  "scopes": ["ingestions:write", "accounts:read"],
  "sandbox": false
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | String | Yes | Human-readable name for the key |
| `scopes` | Array[String] | Yes | Permissions (e.g., `["ingestions:write", "accounts:read"]`) |
| `sandbox` | Boolean | No | Whether this is a sandbox key (default: `false`) |

**Note:** `tenantId` is **not** included in the request body. It is automatically derived from the user's session.

**Response:** `201 Created`

```json
{
  "id": "ak_abc123xyz",
  "prefix": "sk_abc123xyz",
  "apiKey": "asp_live_sk_abc123xyz_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | API key identifier |
| `prefix` | String | Key prefix (for identification) |
| `apiKey` | String | Full API key (shown only once) |

**⚠️ Critical:** The full API key (`apiKey` field) is shown **only once** in this response. Store it securely immediately. Subsequent calls to list API keys will only show the prefix.

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "displayName is required"
  }
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

#### Delete API Key

```http
DELETE /internal/api-keys/{id}
```

**Authentication**: Session cookie (required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | API Key ID |

**Response:** `200 OK`

```json
{
  "deleted": true
}
```

**Error Responses:**

**401 Unauthorized** - Not authenticated
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

**404 Not Found** - API key not found or doesn't belong to tenant
```json
{
  "error": {
    "code": "API_KEY_NOT_FOUND",
    "message": "API key not found"
  }
}
```

---

## Data Models

### AuthResponse

```typescript
interface AuthResponse {
  authenticated: boolean;
  email?: string;
  userId?: string;
  tenantId?: string;
}
```

### TenantMeResponse

```typescript
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

### ApiKeyResponse

```typescript
interface ApiKeyResponse {
  id: string;
  displayName: string;
  prefix: string;
  scopes: string[];
  sandbox: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}
```

### InternalCreateApiKeyRequest

```typescript
interface InternalCreateApiKeyRequest {
  displayName: string;
  scopes: string[];
  sandbox?: boolean;
}
```

**Note:** This request does **not** include `tenantId` - it's automatically derived from the session.

### CreateApiKeyResponse

```typescript
interface CreateApiKeyResponse {
  id: string;
  prefix: string;
  apiKey: string; // Full key - shown only once!
}
```

### DeleteApiKeyResponse

```typescript
interface DeleteApiKeyResponse {
  deleted: boolean;
}
```

---

## TypeScript Definitions

Complete TypeScript definitions for all dashboard API types:

```typescript
// Authentication
interface AuthResponse {
  authenticated: boolean;
  email?: string;
  userId?: string;
  tenantId?: string;
}

interface LogoutResponse {
  loggedOut: boolean;
}

// Tenant
interface TenantMeResponse {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}

// API Keys
interface ApiKeyResponse {
  id: string;
  displayName: string;
  prefix: string;
  scopes: string[];
  sandbox: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

interface InternalCreateApiKeyRequest {
  displayName: string;
  scopes: string[];
  sandbox?: boolean;
}

interface CreateApiKeyResponse {
  id: string;
  prefix: string;
  apiKey: string; // Full key - shown only once!
}

interface DeleteApiKeyResponse {
  deleted: boolean;
}

// Error Response
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

---

## Error Handling

### Error Response Format

All API errors follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional context
    }
  }
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated or session expired |
| `FORBIDDEN` | 403 | User authenticated but lacks permission |
| `NOT_FOUND` | 404 | Resource not found or doesn't belong to tenant |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Example

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    const response = await apiCall();
    return response;
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
    
    const errorData: ErrorResponse = await error.json();
    console.error('API error:', errorData.error.message);
    return null;
  }
}
```

---

## Frontend Integration Guide

### Complete Example: API Key Management Component

```typescript
// api/dashboard.ts
const API_BASE = '/internal';

export async function getTenant(): Promise<TenantMeResponse> {
  const response = await fetch(`${API_BASE}/tenant/me`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get tenant info');
  }
  
  return response.json();
}

export async function listApiKeys(): Promise<ApiKeyResponse[]> {
  const response = await fetch(`${API_BASE}/api-keys`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to list API keys');
  }
  
  return response.json();
}

export async function createApiKey(
  displayName: string,
  scopes: string[],
  sandbox: boolean = false
): Promise<CreateApiKeyResponse> {
  const response = await fetch(`${API_BASE}/api-keys`, {
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
  
  return response.json();
}

export async function deleteApiKey(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api-keys/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete API key');
  }
}

// hooks/useAuth.ts
export function useAuth() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  async function checkAuth() {
    try {
      const response = await fetch('/auth/session/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data: AuthResponse = await response.json();
        setAuth(data.authenticated ? data : null);
      } else {
        setAuth(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuth(null);
    } finally {
      setLoading(false);
    }
  }
  
  async function logout() {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    setAuth(null);
    window.location.href = '/login';
  }
  
  return { auth, loading, logout, checkAuth };
}
```

---

## Best Practices

### 1. Always Include Credentials

```typescript
// ✅ Correct
fetch('/internal/api-keys', {
  credentials: 'include',
});

// ❌ Wrong
fetch('/internal/api-keys'); // Cookie not sent!
```

### 2. Check Authentication on App Startup

```typescript
// App.tsx
useEffect(() => {
  checkAuth().then((auth) => {
    if (!auth?.authenticated) {
      router.push('/login');
    }
  });
}, []);
```

### 3. Handle Expired Sessions

```typescript
async function apiCall() {
  const response = await fetch('/internal/api-keys', {
    credentials: 'include',
  });
  
  if (response.status === 401) {
    // Session expired - redirect to login
    window.location.href = '/login';
    return;
  }
  
  return response.json();
}
```

### 4. Store API Keys Securely

When creating API keys, store them in a secure location:

```typescript
// ✅ Store in secure backend (recommended)
async function createAndStoreApiKey() {
  const response = await createApiKey('My Key', ['read', 'write']);
  
  // Send to backend for secure storage
  await fetch('/api/store-api-key', {
    method: 'POST',
    body: JSON.stringify({ apiKey: response.apiKey }),
  });
}

// ❌ Never store in localStorage or client-side state
localStorage.setItem('apiKey', response.apiKey); // DON'T DO THIS!
```

### 5. Use TypeScript Types

Always use the provided TypeScript types for type safety:

```typescript
import type {
  ApiKeyResponse,
  CreateApiKeyResponse,
  TenantMeResponse,
} from '@/types/dashboard';
```

---

## Comparison: Dashboard API vs Public API

| Feature | Dashboard API | Public API |
|---------|--------------|------------|
| **Authentication** | Session cookie | API key header |
| **Endpoint Prefix** | `/internal/**` | `/v1/**` |
| **Tenant Resolution** | From session (UserPrincipal) | From API key (TenantContext) |
| **Use Case** | Web dashboard UI | Server-to-server, integrations |
| **Client-Side Safe** | ✅ Yes | ❌ No (server-side only) |
| **Request Body** | No `tenantId` field | `tenantId` deprecated (ignored) |
| **Key Management** | `/internal/api-keys` | `/v1/api-keys` |

---

## Support & Resources

- **Frontend Authentication Guide**: See `FRONTEND_AUTHENTICATION_GUIDE.md` for complete authentication flow
- **Public API Reference**: See `PUBLIC_API_REFERENCE.md` for public API documentation
- **Architecture Overview**: See `ARCHITECTURE_OVERVIEW.md` for system architecture

---

## Summary

The Dashboard API provides a secure, session-based interface for the web dashboard. Key points:

- ✅ Uses secure HttpOnly cookies for authentication
- ✅ Tenant ID automatically derived from session
- ✅ No API keys needed for dashboard endpoints
- ✅ Client-side safe (unlike public API)
- ✅ All requests must include `credentials: 'include'`

For server-to-server communication, use the **Public API** (`/v1/**`) with API key authentication instead.

