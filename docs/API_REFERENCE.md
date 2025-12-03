# ASP Platform API Reference

**Version:** 1.0  
**Base URL:** `https://api.asp-platform.com/v1` (Production) | `http://localhost:8080/v1` (Development)  
**Last Updated:** November 2025

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Authentication](#2-authentication)
3. [Endpoints Reference](#3-endpoints-reference)
4. [Ingestion Pipeline](#4-ingestion-pipeline)
5. [Error Handling](#5-error-handling)
6. [Frontend Contract Guarantees](#6-frontend-contract-guarantees)
7. [Frontend Integration Guide](#7-frontend-integration-guide)
8. [TypeScript Type Definitions](#8-typescript-type-definitions)

---

## 1. High-Level System Overview

### Purpose

The ASP Platform is a **PDF-to-Transactions Enrichment** system designed for the Moroccan banking market. It transforms raw PDF bank statements into structured, enriched transaction data with merchant normalization, categorization, and intelligent metadata.

### Core Entities

| Entity | Description |
|--------|-------------|
| **Tenant** | Multi-tenant organization (isolated data) |
| **API Key** | Authentication credential (scoped to tenant) |
| **Bank Connection** | User's connection to a specific bank |
| **Ingestion** | PDF upload and processing job |
| **Account** | Bank account extracted from statements |
| **Transaction** | Individual transaction (normalized + enriched) |
| **Merchant** | Normalized merchant name with categorization |

### Processing Flow

```
┌─────────────────┐
│  PDF Upload     │  POST /v1/ingestions
│  (multipart)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Ingestion Created                  │
│  Status: PENDING                    │
│  Storage: S3 / Local                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  SQS Queue (Async Processing)       │
│  Worker picks up ingestion          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Pipeline Stages:                    │
│  1. TextExtracted                    │
│  2. BankTemplateIdentified           │
│  3. TransactionsParsed                │
│  4. MerchantsNormalized              │
│  5. CategorizationCompleted           │
│  6. SalaryDetection                   │
│  7. RecurringPaymentsDetection       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Enriched Transactions               │
│  Ready for Frontend Consumption      │
└─────────────────────────────────────┘
```

### Authentication Model

All API requests (except `/v1/ping`) require authentication via **API Key**:

```
X-Api-Key: asp_live_<prefix>_<secret>
```

or

```
X-Api-Key: asp_sandbox_<prefix>_<secret>
```

The API key identifies the tenant and enables multi-tenant data isolation.

---

## 2. Authentication

### API Key Format

API keys follow this structure:

- **Live keys:** `asp_live_<prefix>_<secret>`
- **Sandbox keys:** `asp_sandbox_<prefix>_<secret>`

**Example:**
```
asp_live_sk_abc123xyz_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

### Header Format

Include the API key in the `X-Api-Key` header:

```http
POST /v1/ingestions HTTP/1.1
Host: api.asp-platform.com
X-Api-Key: asp_live_sk_abc123xyz_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
Content-Type: multipart/form-data
```

### Error Responses

#### Missing API Key

**Status:** `401 Unauthorized`

```json
{
  "error": "invalid_api_key"
}
```

#### Invalid API Key

**Status:** `401 Unauthorized`

```json
{
  "error": "invalid_api_key"
}
```

#### Suspended/Inactive Tenant

**Status:** `401 Unauthorized`

```json
{
  "error": "invalid_api_key"
}
```

**Note:** For security reasons, the API does not distinguish between invalid keys and suspended tenants. All authentication failures return the same error format.

### Creating API Keys

Use the [API Key Management endpoints](#api-keys) to create, list, and delete API keys.

---

## 3. Endpoints Reference

### Base URL

- **Production:** `https://api.asp-platform.com/v1`
- **Development:** `http://localhost:8080/v1`

### Common Response Headers

```
Content-Type: application/json
X-Request-Id: <trace-id>
```

---

### Ingestions

#### Create Ingestion

Upload a PDF bank statement for processing.

**Endpoint:** `POST /v1/ingestions`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | PDF bank statement file |
| `bankConnectionId` | UUID (query) | Yes | Bank connection ID |

**Example Request:**

```bash
curl -X POST "https://api.asp-platform.com/v1/ingestions?bankConnectionId=550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..." \
  -F "file=@statement.pdf"
```

**Response:** `201 Created`

```json
{
  "id": "df989955-3ac5-4dee-a5d7-61b7060b0ac1",
  "bankConnectionId": "550e8400-e29b-41d4-a716-446655440000",
  "userRef": "user_123",
  "status": "PENDING",
  "source": "PDF_UPLOAD",
  "ingestionType": "PDF",
  "originalFileName": "statement.pdf",
  "fileSize": 875328,
  "storagePath": "tenants/550e8400-e29b-41d4-a716-446655440000/ingestions/df989955-3ac5-4dee-a5d7-61b7060b0ac1/original/statement.pdf",
  "errorCode": null,
  "errorMessage": null,
  "createdAt": "2025-11-29T15:10:47Z",
  "updatedAt": "2025-11-29T15:10:47Z",
  "processedAt": null
}
```

**Status Field Values:**

| Status | Description |
|--------|-------------|
| `PENDING` | Uploaded, waiting for processing |
| `PROCESSING` | Currently being processed |
| `PARSED` | Text extracted, bank detected, transactions parsed |
| `SAVING` | Writing to database |
| `PROCESSED` | Successfully completed |
| `FAILED` | Processing failed (check `errorCode` and `errorMessage`) |

**Error Responses:**

**400 Bad Request** - Invalid file or missing parameters
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File is required",
    "details": {
      "field": "file",
      "reason": "missing"
    }
  }
}
```

**401 Unauthorized** - Missing or invalid API key
```json
{
  "error": "invalid_api_key"
}
```

**404 Not Found** - Bank connection not found
```json
{
  "error": {
    "code": "BANK_CONNECTION_NOT_FOUND",
    "message": "Bank connection not found"
  }
}
```

---

#### Get Ingestion

Retrieve ingestion details including processing status and metadata.

**Endpoint:** `GET /v1/ingestions/{id}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Ingestion ID |

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/ingestions/df989955-3ac5-4dee-a5d7-61b7060b0ac1" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
{
  "id": "df989955-3ac5-4dee-a5d7-61b7060b0ac1",
  "bankConnectionId": "550e8400-e29b-41d4-a716-446655440000",
  "userRef": "user_123",
  "status": "PARSED",
  "source": "PDF_UPLOAD",
  "ingestionType": "PDF",
  "originalFileName": "statement.pdf",
  "fileSize": 875328,
  "storagePath": "tenants/550e8400-e29b-41d4-a716-446655440000/ingestions/df989955-3ac5-4dee-a5d7-61b7060b0ac1/original/statement.pdf",
  "errorCode": null,
  "errorMessage": null,
  "createdAt": "2025-11-29T15:10:47Z",
  "updatedAt": "2025-11-29T15:15:23Z",
  "processedAt": "2025-11-29T15:15:20Z"
}
```

**Error Responses:**

**401 Unauthorized** - Missing or invalid API key
```json
{
  "error": "invalid_api_key"
}
```

**404 Not Found** - Ingestion not found
```json
{
  "error": {
    "code": "INGESTION_NOT_FOUND",
    "message": "Ingestion not found"
  }
}
```

---

#### List Ingestions

List all ingestions for the authenticated tenant.

**Endpoint:** `GET /v1/ingestions`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userRef` | String | No | Filter by user reference |
| `bankConnectionId` | UUID | No | Filter by bank connection ID |

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/ingestions?userRef=user_123" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
[
  {
    "id": "df989955-3ac5-4dee-a5d7-61b7060b0ac1",
    "bankConnectionId": "550e8400-e29b-41d4-a716-446655440000",
    "userRef": "user_123",
    "status": "PARSED",
    "source": "PDF_UPLOAD",
    "ingestionType": "PDF",
    "originalFileName": "statement.pdf",
    "fileSize": 875328,
    "storagePath": "...",
    "errorCode": null,
    "errorMessage": null,
    "createdAt": "2025-11-29T15:10:47Z",
    "updatedAt": "2025-11-29T15:15:23Z",
    "processedAt": "2025-11-29T15:15:20Z"
  }
]
```

---

### Accounts

#### List Accounts

Get all accounts for the authenticated tenant.

**Endpoint:** `GET /v1/accounts`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userRef` | String | No | Filter by user reference |

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/accounts?userRef=user_123" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
[
  {
    "id": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
    "accountNumber": "1234567890",
    "iban": "MA123456789012345678901234",
    "accountType": "CHECKING",
    "currency": "MAD",
    "balance": 12500.50,
    "bankConnectionId": "550e8400-e29b-41d4-a716-446655440000",
    "userRef": "user_123",
    "updatedAt": "2025-11-29T15:15:20Z"
  }
]
```

---

#### Get Account

Get a specific account by ID.

**Endpoint:** `GET /v1/accounts/{accountId}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountId` | UUID | Account ID |

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
  "accountNumber": "1234567890",
  "iban": "MA123456789012345678901234",
  "accountType": "CHECKING",
  "currency": "MAD",
  "balance": 12500.50,
  "bankConnectionId": "550e8400-e29b-41d4-a716-446655440000",
  "userRef": "user_123",
  "updatedAt": "2025-11-29T15:15:20Z"
}
```

**Error Responses:**

**404 Not Found** - Account not found
```json
{
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "Account not found"
  }
}
```

---

#### Get Account Transactions

Get paginated transactions for an account.

**Endpoint:** `GET /v1/accounts/{accountId}/transactions`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountId` | UUID | Account ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | Date (ISO) | No | - | Filter transactions from this date |
| `endDate` | Date (ISO) | No | - | Filter transactions until this date |
| `limit` | Integer | No | 100 | Maximum number of transactions to return |
| `offset` | Integer | No | 0 | Number of transactions to skip |
| `category` | String | No | - | Filter by category |
| `merchant` | String | No | - | Filter by merchant name |

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/accounts/a1b2c3d4-e5f6-4789-a012-3456789abcde/transactions?startDate=2025-11-01&limit=50" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
{
  "accountId": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
  "transactions": [
    {
      "id": "t1b2c3d4-e5f6-4789-a012-3456789abcde",
      "date": "2025-11-15",
      "description": "PAIEMENT INTERNET APPLE.COM",
      "rawDescription": "08/0908/09 PAIEMENT INTERNET INTERNATIONAL CARTE0332 APPLE.COM BI 28,04",
      "amount": -28.04,
      "currency": "MAD",
      "category": "Subscriptions",
      "merchant": "Apple"
    },
    {
      "id": "t2b2c3d4-e5f6-4789-a012-3456789abcde",
      "date": "2025-11-14",
      "description": "GLOVO PZ",
      "rawDescription": "GLOVO PZ 45,50",
      "amount": -45.50,
      "currency": "MAD",
      "category": "Food Delivery",
      "merchant": "Glovo"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 125
  }
}
```

---

#### Get Account Snapshots

Get balance snapshots for an account.

**Endpoint:** `GET /v1/accounts/{accountId}/snapshots`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountId` | UUID | Account ID |

**Response:** `200 OK`

```json
[
  {
    "accountId": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
    "balance": 12500.50,
    "currency": "MAD",
    "snapshotDate": "2025-11-29",
    "createdAt": "2025-11-29T15:15:20Z"
  }
]
```

---

### API Keys

#### Create API Key

Create a new API key for the tenant.

**Endpoint:** `POST /v1/api-keys`

**Authentication:** Required

**Request Body:**

```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "Production API Key",
  "scopes": ["ingestions:write", "accounts:read"],
  "sandbox": false
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantId` | UUID | Yes | Tenant ID |
| `displayName` | String | Yes | Human-readable name for the key |
| `scopes` | Array[String] | Yes | Permissions (currently all keys have full access) |
| `sandbox` | Boolean | No | Whether this is a sandbox key (default: `false`) |

**Example Request:**

```bash
curl -X POST "https://api.asp-platform.com/v1/api-keys" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..." \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "Production API Key",
    "scopes": ["ingestions:write", "accounts:read"],
    "sandbox": false
  }'
```

**Response:** `201 Created`

```json
{
  "id": "ak_abc123xyz",
  "prefix": "sk_abc123xyz",
  "apiKey": "asp_live_sk_abc123xyz_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
}
```

**⚠️ Important:** The full API key (`apiKey` field) is shown **only once** in this response. Store it securely. Subsequent calls to list API keys will only show the prefix.

---

#### List API Keys

List all API keys for the authenticated tenant.

**Endpoint:** `GET /v1/api-keys`

**Authentication:** Required

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/api-keys" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

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

---

#### Delete API Key

Delete an API key. The key will immediately stop working.

**Endpoint:** `DELETE /v1/api-keys/{id}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | API Key ID |

**Example Request:**

```bash
curl -X DELETE "https://api.asp-platform.com/v1/api-keys/ak_abc123xyz" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
{
  "deleted": true
}
```

---

### Banks

#### List Banks

Get the directory of supported banks.

**Endpoint:** `GET /v1/banks`

**Authentication:** Required

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/banks" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "CIH Bank",
    "slug": "cih-bank",
    "country": "MA",
    "connectionType": "PDF_UPLOAD",
    "iconUrl": "https://cdn.asp-platform.com/banks/cih.png"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Attijariwafa Bank",
    "slug": "attijariwafa-bank",
    "country": "MA",
    "connectionType": "PDF_UPLOAD",
    "iconUrl": "https://cdn.asp-platform.com/banks/attijariwafa.png"
  }
]
```

---

### Bank Connections

#### Create Bank Connection

Create a connection to a bank for a user.

**Endpoint:** `POST /v1/bank-connections/{bankId}/connect`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `bankId` | UUID | Bank ID from the banks directory |

**Request Body:**

```json
{
  "userRef": "user_123"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userRef` | String | Yes | User identifier in your system |

**Example Request:**

```bash
curl -X POST "https://api.asp-platform.com/v1/bank-connections/550e8400-e29b-41d4-a716-446655440000/connect" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..." \
  -H "Content-Type: application/json" \
  -d '{
    "userRef": "user_123"
  }'
```

**Response:** `201 Created`

```json
{
  "connectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
  "bankId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CONNECTED",
  "userRef": "user_123",
  "nextStep": {
    "action": "UPLOAD_PDF",
    "message": "Upload a PDF statement to start processing"
  },
  "metadata": {}
}
```

**Status Values:**

| Status | Description |
|--------|-------------|
| `CONNECTED` | Connection established, ready for PDF upload |
| `PENDING` | Connection in progress |
| `FAILED` | Connection failed |

---

#### List Bank Connections

List all bank connections for the authenticated tenant.

**Endpoint:** `GET /v1/bank-connections`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userRef` | String | No | Filter by user reference |

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/bank-connections?userRef=user_123" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
[
  {
    "connectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
    "bankId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CONNECTED",
    "userRef": "user_123",
    "nextStep": {
      "action": "UPLOAD_PDF",
      "message": "Upload a PDF statement to start processing"
    },
    "metadata": {}
  }
]
```

---

#### Get Bank Connection

Get a specific bank connection by ID.

**Endpoint:** `GET /v1/bank-connections/{connectionId}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `connectionId` | UUID | Bank connection ID |

**Response:** `200 OK`

```json
{
  "connectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
  "bankId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CONNECTED",
  "userRef": "user_123",
  "nextStep": {
    "action": "UPLOAD_PDF",
    "message": "Upload a PDF statement to start processing"
  },
  "metadata": {}
}
```

---

### Ping

#### Health Check

Check API health and authentication status.

**Endpoint:** `GET /v1/ping`

**Authentication:** Optional (if authenticated, returns tenant ID)

**Example Request:**

```bash
curl -X GET "https://api.asp-platform.com/v1/ping"
```

**Response:** `200 OK`

```json
{
  "status": "ok",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

If not authenticated, `tenantId` will be `null`.

---

## 4. Ingestion Pipeline

The ingestion pipeline processes PDF bank statements through multiple stages. The frontend can track progress by polling `GET /v1/ingestions/{id}` and checking the `status` field.

### Pipeline Stages

| Stage | Status | Description |
|-------|--------|-------------|
| **1. PDF Uploaded** | `PENDING` | PDF uploaded to storage (S3 or local) |
| **2. Text Extracted** | `PROCESSING` | PDF text extraction in progress |
| **3. Bank Template Identified** | `PROCESSING` | Bank detected from text patterns |
| **4. Transactions Parsed** | `PARSED` | Transactions extracted and normalized |
| **5. Merchants Normalized** | `PARSED` | Merchant names cleaned and normalized |
| **6. Categorization Completed** | `PARSED` | Transactions categorized |
| **7. Salary Detection** | `PARSED` | Salary transactions identified (future) |
| **8. Recurring Payments Detection** | `PARSED` | Recurring transactions grouped (future) |

### Status Flow

```
PENDING → PROCESSING → PARSED → PROCESSED
                ↓
              FAILED
```

### Status Details

#### PENDING
- **Description:** PDF uploaded, waiting for worker to pick up
- **Next Status:** `PROCESSING` (when worker starts)
- **Duration:** Typically < 1 minute

#### PROCESSING
- **Description:** Worker is actively processing the PDF
- **Stages:** Text extraction, bank detection, parsing
- **Next Status:** `PARSED` (success) or `FAILED` (error)
- **Duration:** 10-60 seconds depending on PDF size

#### PARSED
- **Description:** Transactions extracted, normalized, and enriched
- **Stages:** Merchant normalization, categorization completed
- **Next Status:** `PROCESSED` (when saved to database)
- **Duration:** < 1 second

#### PROCESSED
- **Description:** All data persisted, ready for consumption
- **Final Status:** No further transitions
- **Transactions Available:** Yes (via `/v1/accounts/{id}/transactions`)

#### FAILED
- **Description:** Processing failed at any stage
- **Error Details:** Check `errorCode` and `errorMessage` fields
- **Recovery:** Can retry by re-uploading the PDF

### Error Codes

| Error Code | Description | Recoverable |
|------------|-------------|-------------|
| `UPLOAD_FAILED` | Failed to upload PDF to storage | Yes |
| `TEXT_EXTRACTION_FAILED` | Could not extract text from PDF | Yes (if PDF is valid) |
| `DETECTION_UNKNOWN_BANK` | Could not identify bank from statement | No |
| `PARSING_FAILED` | Failed to parse transactions | No |
| `ENRICHMENT_FAILED` | Failed to enrich transactions | Yes |

### Example: Tracking Pipeline Progress

```typescript
// Poll ingestion status
const pollIngestion = async (ingestionId: string) => {
  const response = await fetch(`/v1/ingestions/${ingestionId}`, {
    headers: { 'X-Api-Key': apiKey }
  });
  const ingestion = await response.json();
  
  switch (ingestion.status) {
    case 'PENDING':
      return { stage: 'PDF Uploaded', progress: 10 };
    case 'PROCESSING':
      return { stage: 'Processing', progress: 50 };
    case 'PARSED':
      return { stage: 'Enrichment Complete', progress: 90 };
    case 'PROCESSED':
      return { stage: 'Complete', progress: 100 };
    case 'FAILED':
      return { stage: 'Failed', progress: 0, error: ingestion.errorMessage };
  }
};
```

---

## 5. Error Handling

### Unified Error Format

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

### Error Categories

#### Authentication Errors

**Status:** `401 Unauthorized`

```json
{
  "error": "invalid_api_key"
}
```

**Note:** Authentication errors use a simplified format (string instead of object) for security reasons.

---

#### Validation Errors

**Status:** `400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "file",
      "reason": "File size exceeds 10MB limit"
    }
  }
}
```

---

#### Not Found Errors

**Status:** `404 Not Found`

```json
{
  "error": {
    "code": "INGESTION_NOT_FOUND",
    "message": "Ingestion not found"
  }
}
```

---

#### Server Errors

**Status:** `500 Internal Server Error`

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "details": {
      "requestId": "trace-123"
    }
  }
}
```

---

#### Rate Limit Errors (Future)

**Status:** `429 Too Many Requests`

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_api_key` | 401 | Missing or invalid API key |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INGESTION_NOT_FOUND` | 404 | Ingestion not found |
| `ACCOUNT_NOT_FOUND` | 404 | Account not found |
| `BANK_CONNECTION_NOT_FOUND` | 404 | Bank connection not found |
| `UPLOAD_FAILED` | 500 | Failed to upload file |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## 6. Frontend Contract Guarantees

### Response Field Stability

- **All response fields are stable** and will not be removed without a version bump
- **New fields may be added** but will not break existing code
- **Field types will not change** (e.g., string will not become number)

### Casing Convention

- **All JSON fields use `camelCase`** (e.g., `bankConnectionId`, `createdAt`)
- **Exception:** Error responses may use `snake_case` for consistency with backend

### Pagination Model

For paginated endpoints (e.g., transactions):

```typescript
{
  "data": [...],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 500
  }
}
```

**Future endpoints will follow this pattern.**

### Versioning

- **Current version:** `v1`
- **Breaking changes:** Will result in a new version (e.g., `v2`)
- **Non-breaking changes:** Added fields, new endpoints (same version)

### Date/Time Format

- **All timestamps use ISO 8601 format:** `2025-11-29T15:10:47Z`
- **All dates use ISO 8601 format:** `2025-11-29`

### UUID Format

- **All IDs are UUIDs (v4):** `550e8400-e29b-41d4-a716-446655440000`
- **Always returned as strings** (not numbers)

---

## 7. Frontend Integration Guide

### Building an Ingestion Detail Page

**Step 1:** Create ingestion
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch(`/v1/ingestions?bankConnectionId=${connectionId}`, {
  method: 'POST',
  headers: { 'X-Api-Key': apiKey },
  body: formData
});

const ingestion = await response.json();
// Store ingestion.id for polling
```

**Step 2:** Poll for status updates
```typescript
const pollStatus = async (ingestionId: string) => {
  const response = await fetch(`/v1/ingestions/${ingestionId}`, {
    headers: { 'X-Api-Key': apiKey }
  });
  return await response.json();
};

// Poll every 2 seconds until status is PROCESSED or FAILED
const interval = setInterval(async () => {
  const ingestion = await pollStatus(ingestionId);
  updateUI(ingestion);
  
  if (ingestion.status === 'PROCESSED' || ingestion.status === 'FAILED') {
    clearInterval(interval);
  }
}, 2000);
```

**Step 3:** Display pipeline progress
```typescript
const getProgress = (status: string) => {
  const statusMap = {
    'PENDING': { label: 'Uploaded', progress: 10 },
    'PROCESSING': { label: 'Processing', progress: 50 },
    'PARSED': { label: 'Enriching', progress: 90 },
    'PROCESSED': { label: 'Complete', progress: 100 },
    'FAILED': { label: 'Failed', progress: 0 }
  };
  return statusMap[status] || { label: 'Unknown', progress: 0 };
};
```

**Step 4:** Fetch transactions when complete
```typescript
if (ingestion.status === 'PROCESSED') {
  const accountId = await getAccountIdFromIngestion(ingestion);
  const transactions = await fetchTransactions(accountId);
  displayTransactions(transactions);
}
```

---

### Showing Pipeline Progress

**Recommended UI Pattern:**

```typescript
const PipelineProgress = ({ ingestion }: { ingestion: Ingestion }) => {
  const stages = [
    { key: 'PENDING', label: 'PDF Uploaded', icon: '📄' },
    { key: 'PROCESSING', label: 'Processing', icon: '⚙️' },
    { key: 'PARSED', label: 'Enriching', icon: '✨' },
    { key: 'PROCESSED', label: 'Complete', icon: '✅' }
  ];
  
  const currentIndex = stages.findIndex(s => s.key === ingestion.status);
  
  return (
    <div className="pipeline-progress">
      {stages.map((stage, index) => (
        <div
          key={stage.key}
          className={index <= currentIndex ? 'active' : 'pending'}
        >
          {stage.icon} {stage.label}
        </div>
      ))}
    </div>
  );
};
```

---

### Listing API Keys

**Example Implementation:**

```typescript
const ApiKeysList = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  
  useEffect(() => {
    fetch('/v1/api-keys', {
      headers: { 'X-Api-Key': apiKey }
    })
      .then(res => res.json())
      .then(setKeys);
  }, []);
  
  return (
    <div>
      {keys.map(key => (
        <div key={key.id}>
          <h3>{key.displayName}</h3>
          <p>Prefix: {key.prefix}</p>
          <p>Last used: {key.lastUsedAt || 'Never'}</p>
          <button onClick={() => deleteKey(key.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

---

### API Client Setup

**Recommended TypeScript API Client:**

```typescript
class AspApiClient {
  constructor(private apiKey: string, private baseUrl: string) {}
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error);
    }
    
    return response.json();
  }
  
  async createIngestion(file: File, bankConnectionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<Ingestion>(
      `/v1/ingestions?bankConnectionId=${bankConnectionId}`,
      {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      }
    );
  }
  
  async getIngestion(id: string) {
    return this.request<Ingestion>(`/v1/ingestions/${id}`);
  }
  
  // ... other methods
}
```

---

### Recommended TypeScript Interfaces

See [TypeScript Type Definitions](#8-typescript-type-definitions) section below for complete type definitions.

---

## 8. TypeScript Type Definitions

Copy these type definitions directly into your frontend project.

```typescript
// ============================================
// Core Types
// ============================================

export type UUID = string;

export type IngestionStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'PARSED' 
  | 'SAVING' 
  | 'PROCESSED' 
  | 'FAILED';

export type IngestionSource = 'PDF_UPLOAD' | 'API';

export type IngestionType = 'PDF';

export type BankConnectionStatus = 
  | 'CONNECTED' 
  | 'PENDING' 
  | 'FAILED';

export type TransactionDirection = 'CREDIT' | 'DEBIT';

// ============================================
// Ingestion Types
// ============================================

export interface Ingestion {
  id: UUID;
  bankConnectionId: UUID;
  userRef: string;
  status: IngestionStatus;
  source: IngestionSource;
  ingestionType: IngestionType;
  originalFileName: string | null;
  fileSize: number | null;
  storagePath: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  processedAt: string | null; // ISO 8601
}

// ============================================
// Account Types
// ============================================

export interface Account {
  id: UUID;
  accountNumber: string;
  iban: string | null;
  accountType: string;
  currency: string;
  balance: number;
  bankConnectionId: UUID;
  userRef: string;
  updatedAt: string; // ISO 8601
}

export interface AccountSnapshot {
  accountId: UUID;
  balance: number;
  currency: string;
  snapshotDate: string; // ISO 8601 date
  createdAt: string; // ISO 8601
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction {
  id: UUID;
  date: string; // ISO 8601 date
  description: string;
  rawDescription: string;
  amount: number; // Negative for debits, positive for credits
  currency: string;
  category: string | null;
  merchant: string | null;
}

export interface PaginatedTransactions {
  accountId: UUID;
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
}

// ============================================
// API Key Types
// ============================================

export interface ApiKey {
  id: UUID;
  displayName: string;
  prefix: string;
  scopes: string[];
  sandbox: boolean;
  createdAt: string; // ISO 8601
  lastUsedAt: string | null; // ISO 8601
}

export interface CreateApiKeyRequest {
  tenantId: UUID;
  displayName: string;
  scopes: string[];
  sandbox?: boolean;
}

export interface CreateApiKeyResponse {
  id: UUID;
  prefix: string;
  apiKey: string; // Full key (shown only once)
}

export interface DeleteApiKeyResponse {
  deleted: boolean;
}

// ============================================
// Bank Types
// ============================================

export interface Bank {
  id: UUID;
  name: string;
  slug: string;
  country: string;
  connectionType: string;
  iconUrl: string | null;
}

// ============================================
// Bank Connection Types
// ============================================

export interface BankConnectionNextStep {
  action: string;
  message: string;
}

export interface BankConnection {
  connectionId: UUID;
  bankId: UUID;
  status: BankConnectionStatus;
  userRef: string;
  nextStep: BankConnectionNextStep | null;
  metadata: Record<string, any>;
}

export interface CreateBankConnectionRequest {
  userRef: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  error: string | ErrorDetail;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ============================================
// Request/Response Types
// ============================================

export interface PingResponse {
  status: 'ok';
  tenantId: UUID | null;
}

// ============================================
// Utility Types
// ============================================

export type ApiResponse<T> = T;

export interface ListResponse<T> extends Array<T> {}

// ============================================
// API Client Interface
// ============================================

export interface AspApiClient {
  // Ingestions
  createIngestion(
    file: File,
    bankConnectionId: UUID
  ): Promise<Ingestion>;
  
  getIngestion(id: UUID): Promise<Ingestion>;
  
  listIngestions(params?: {
    userRef?: string;
    bankConnectionId?: UUID;
  }): Promise<Ingestion[]>;
  
  // Accounts
  getAccounts(params?: { userRef?: string }): Promise<Account[]>;
  
  getAccount(accountId: UUID): Promise<Account>;
  
  getAccountTransactions(
    accountId: UUID,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
      category?: string;
      merchant?: string;
    }
  ): Promise<PaginatedTransactions>;
  
  getAccountSnapshots(accountId: UUID): Promise<AccountSnapshot[]>;
  
  // API Keys
  createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse>;
  
  listApiKeys(): Promise<ApiKey[]>;
  
  deleteApiKey(id: UUID): Promise<DeleteApiKeyResponse>;
  
  // Banks
  listBanks(): Promise<Bank[]>;
  
  // Bank Connections
  createBankConnection(
    bankId: UUID,
    request: CreateBankConnectionRequest
  ): Promise<BankConnection>;
  
  listBankConnections(params?: { userRef?: string }): Promise<BankConnection[]>;
  
  getBankConnection(connectionId: UUID): Promise<BankConnection>;
  
  // Utility
  ping(): Promise<PingResponse>;
}
```

---

## Sandbox Mode

### Overview

Sandbox mode allows testing the API without affecting production data. Sandbox API keys are created with `sandbox: true` and operate in an isolated environment.

### Sandbox Behavior

- **Data Isolation:** Sandbox data is completely separate from production
- **Mock Responses:** Some endpoints return mock data for faster testing
- **No Real Processing:** PDF uploads are accepted but may return mock transaction data
- **Same API:** All endpoints work identically to production

### Creating Sandbox API Keys

```typescript
const response = await fetch('/v1/api-keys', {
  method: 'POST',
  headers: {
    'X-Api-Key': productionApiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tenantId: tenantId,
    displayName: 'Sandbox Test Key',
    scopes: ['ingestions:write', 'accounts:read'],
    sandbox: true
  })
});

const { apiKey } = await response.json();
// Use apiKey for sandbox requests
```

### Typical Sandbox Responses

**Ingestion Creation:**
- Returns immediately with `status: PENDING`
- Processing may be faster or use mock data

**Transactions:**
- May return sample transactions for testing
- Categories and merchants are realistic but not from actual PDFs

---

## Support & Resources

### API Explorer

**Coming Soon:** Interactive API explorer at `https://api.asp-platform.com/docs`

### Rate Limits

**Current:** No rate limits (subject to change)

**Future:** Rate limits will be communicated via headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```

### Webhooks

**Coming Soon:** Webhook support for ingestion status updates

### Support

- **Email:** support@asp-platform.com
- **Documentation:** https://docs.asp-platform.com
- **Status Page:** https://status.asp-platform.com

---

## Changelog

### v1.0 (November 2025)

- Initial API release
- PDF ingestion support
- Transaction enrichment
- API key management
- Bank directory and connections
- Account and transaction queries

---

**Last Updated:** November 29, 2025  
**Document Version:** 1.0

