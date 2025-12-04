# Frontend Integration Summary

**Quick Reference Guide for Frontend Developers & AI Agents**

---

## 📚 Documentation Index

1. **[FRONTEND_AUTHENTICATION_GUIDE.md](./FRONTEND_AUTHENTICATION_GUIDE.md)** - Complete authentication guide (sessions + API keys)
2. **[DASHBOARD_API_REFERENCE.md](./DASHBOARD_API_REFERENCE.md)** - Dashboard API endpoints (`/internal/**`)
3. **[PUBLIC_API_REFERENCE.md](./PUBLIC_API_REFERENCE.md)** - Public API endpoints (`/v1/**`)

---

## 🎯 Quick Decision Tree

```
Need to integrate with ASP Platform?
│
├─ Are you building a WEB DASHBOARD?
│  └─ YES → Use Dashboard API (/internal/**)
│     ├─ Authentication: Session cookies
│     ├─ Tenant: From user session
│     └─ See: DASHBOARD_API_REFERENCE.md
│
└─ Are you building a SERVER-SIDE INTEGRATION?
   └─ YES → Use Public API (/v1/**)
      ├─ Authentication: API key header
      ├─ Tenant: From API key
      └─ See: PUBLIC_API_REFERENCE.md
```

---

## 🔐 Authentication Systems

### System 1: Dashboard (Session-Based)

**Use for:** Web dashboard, user-facing features

**Authentication:** Session cookie (`asp_session`)

**Endpoints:** `/internal/**`, `/auth/**`

**Tenant Resolution:** From user session (UserPrincipal)

**Example:**
```typescript
// Check if logged in
const auth = await fetch('/auth/session/me', {
  credentials: 'include',
});

// Get tenant info
const tenant = await fetch('/internal/tenant/me', {
  credentials: 'include',
});

// List API keys
const keys = await fetch('/internal/api-keys', {
  credentials: 'include',
});
```

### System 2: Public API (API Key-Based)

**Use for:** Server-to-server, integrations, external developers

**Authentication:** API key in `X-Api-Key` header

**Endpoints:** `/v1/**`

**Tenant Resolution:** From API key (TenantContext)

**Example:**
```typescript
// Server-side only (Node.js, etc.)
const response = await fetch('https://api.asp-platform.com/v1/api-keys', {
  headers: {
    'X-Api-Key': process.env.ASP_API_KEY,
  },
});
```

---

## 📋 Common Use Cases

### Use Case 1: User Login Flow

```typescript
// 1. Redirect to Google OAuth
window.location.href = '/auth/google/login';

// 2. After callback, check session
const auth = await fetch('/auth/session/me', {
  credentials: 'include',
});

// 3. Get tenant info
const tenant = await fetch('/internal/tenant/me', {
  credentials: 'include',
});
```

### Use Case 2: API Key Management (Dashboard)

```typescript
// List keys
const keys = await fetch('/internal/api-keys', {
  credentials: 'include',
});

// Create key
const newKey = await fetch('/internal/api-keys', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    displayName: 'My Key',
    scopes: ['read', 'write'],
    sandbox: false,
  }),
});

// ⚠️ Store newKey.apiKey securely - shown only once!
```

### Use Case 3: Server-Side Integration

```typescript
// Server-side only (Node.js backend)
class ASPClient {
  constructor(private apiKey: string) {}
  
  async listAccounts() {
    return fetch('https://api.asp-platform.com/v1/accounts', {
      headers: { 'X-Api-Key': this.apiKey },
    });
  }
}
```

---

## 🚨 Critical Security Notes

### ✅ DO

- **Dashboard API**: Always use `credentials: 'include'` in fetch requests
- **Public API**: Store API keys in environment variables (server-side only)
- **API Keys**: Store full key securely when created (shown only once)
- **HTTPS**: Always use HTTPS in production

### ❌ DON'T

- **Never expose API keys** in client-side JavaScript
- **Never store API keys** in localStorage or client-side state
- **Never use Public API** in browser JavaScript
- **Never skip credentials** in dashboard API calls

---

## 📦 TypeScript Types

### Quick Import

```typescript
// Dashboard API Types
interface AuthResponse {
  authenticated: boolean;
  email?: string;
  userId?: string;
  tenantId?: string;
}

interface TenantMeResponse {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}

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
```

---

## 🔄 Migration Notes

### From Old API (with tenantId in body)

**Before:**
```typescript
await fetch('/v1/api-keys', {
  body: JSON.stringify({
    tenantId: '...', // ❌ Deprecated
    displayName: 'My Key',
  }),
});
```

**After:**
```typescript
// Public API - tenantId removed (derived from API key)
await fetch('/v1/api-keys', {
  headers: { 'X-Api-Key': apiKey },
  body: JSON.stringify({
    displayName: 'My Key', // tenantId not needed
  }),
});

// Dashboard API - tenantId never needed
await fetch('/internal/api-keys', {
  credentials: 'include',
  body: JSON.stringify({
    displayName: 'My Key', // tenantId from session
  }),
});
```

---

## 📖 Full Documentation

For complete details, see:

1. **FRONTEND_AUTHENTICATION_GUIDE.md** - Complete authentication guide with examples
2. **DASHBOARD_API_REFERENCE.md** - All dashboard endpoints (`/internal/**`)
3. **PUBLIC_API_REFERENCE.md** - All public endpoints (`/v1/**`)

---

## 🎓 Architecture Pattern

This follows the **industry-standard SaaS pattern** used by:

- **Stripe**: `/v1/**` (API keys) + Dashboard (sessions)
- **Plaid**: `/v1/**` (API keys) + Dashboard (sessions)
- **Tink**: `/v1/**` (API keys) + Dashboard (sessions)

**Key Principle:** Separate authentication systems for different audiences:
- **Developers** → API keys (stateless, programmatic)
- **Users** → Sessions (stateful, web-based)

---

## ✅ Checklist for Frontend Integration

- [ ] Understand which API to use (Dashboard vs Public)
- [ ] Implement session check on app startup
- [ ] Always include `credentials: 'include'` for dashboard API
- [ ] Handle 401 errors (redirect to login)
- [ ] Store API keys securely (server-side only)
- [ ] Use TypeScript types for type safety
- [ ] Handle expired sessions gracefully
- [ ] Never expose API keys in client-side code

---

**Last Updated:** December 2024

