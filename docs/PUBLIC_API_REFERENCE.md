# ASP Platform - Public API Reference

**Version:** 1.0  
**Base URL:** `https://api.asp-platform.com/v1` (Production) | `http://localhost:8080/v1` (Development)  
**Last Updated:** December 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL & Headers](#base-url--headers)
4. [Endpoints](#endpoints)
   - [Ping](#ping)
   - [Banks](#banks)
   - [Bank Connections](#bank-connections)
   - [Ingestions](#ingestions)
   - [Accounts](#accounts)
   - [API Keys](#api-keys)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limits](#rate-limits)
8. [TypeScript Definitions](#typescript-definitions)

---

## Overview

The ASP Platform Public API provides a RESTful interface for:

- **Bank Directory**: List supported Moroccan banks
- **Bank Connections**: Manage user connections to banks
- **Ingestions**: Upload and track PDF bank statement processing
- **Accounts**: Query bank accounts and transactions
- **API Keys**: Manage authentication credentials

All endpoints require API key authentication (except `/v1/ping`).

---

## Authentication

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
GET /v1/banks HTTP/1.1
Host: api.asp-platform.com
X-Api-Key: asp_live_sk_abc123xyz_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

### Authentication Errors

**Status:** `401 Unauthorized`

```json
{
  "error": "invalid_api_key"
}
```

**Common Causes:**
- Missing `X-Api-Key` header
- Invalid API key format
- Expired or revoked API key
- Tenant account suspended

---

## Base URL & Headers

### Base URL

- **Production:** `https://api.asp-platform.com/v1`
- **Development:** `http://localhost:8080/v1`

### Required Headers

```http
X-Api-Key: asp_live_sk_<prefix>_<secret>
Content-Type: application/json
```

### Optional Headers

```http
User-Agent: YourApp/1.0
Accept: application/json
```

---

## Endpoints

### Ping

#### Health Check

Check API health and verify authentication.

**Endpoint:** `GET /v1/ping`

**Authentication:** Optional (returns tenant ID if authenticated)

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/ping" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
{
  "status": "ok",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | Always `"ok"` |
| `tenantId` | String \| null | Tenant ID if authenticated, `null` otherwise |

---

### Banks

#### List Banks

Get the directory of supported Moroccan banks.

**Endpoint:** `GET /v1/banks`

**Authentication:** Required

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/banks" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "CIH",
    "name": "CIH Bank",
    "logoUrl": "https://cdn.asp-platform.com/banks/cih.png",
    "country": "MA",
    "active": true
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "code": "ATTIJARIWAFA",
    "name": "Attijariwafa Bank",
    "logoUrl": "https://cdn.asp-platform.com/banks/attijariwafa.png",
    "country": "MA",
    "active": true
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Bank identifier |
| `code` | String | Short bank code (e.g., "CIH", "ATTIJARIWAFA") |
| `name` | String | Bank display name |
| `logoUrl` | String \| null | Bank logo URL |
| `country` | String | Country code (always "MA" for Moroccan banks) |
| `active` | Boolean | Whether the bank is active and available |

**Notes:**
- Returns only active banks
- Banks are global (not tenant-scoped)
- Use `code` for programmatic identification
- Use `id` for API operations (e.g., creating bank connections)

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

**Request:**
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `connectionId` | UUID | Bank connection identifier |
| `bankId` | UUID | Bank ID |
| `status` | String | Connection status (see Status Values below) |
| `userRef` | String | User reference |
| `nextStep` | Object \| null | Next step information (see Next Step below) |
| `metadata` | Object | Additional metadata (JSON object) |

**Status Values:**

| Status | Description |
|--------|-------------|
| `CONNECTED` | Connection established, ready for PDF upload |
| `PENDING` | Connection in progress |
| `WAITING_UPLOAD` | Waiting for PDF upload |
| `WAITING_OAUTH` | Waiting for OAuth completion (future) |
| `FAILED` | Connection failed |

**Next Step Object:**

```json
{
  "action": "UPLOAD_PDF",
  "message": "Upload a PDF statement to start processing"
}
```

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "userRef is required"
  }
}
```

**404 Not Found** - Bank not found
```json
{
  "error": {
    "code": "BANK_NOT_FOUND",
    "message": "Bank not found"
  }
}
```

---

#### List Bank Connections

List all bank connections for the authenticated tenant.

**Endpoint:** `GET /v1/bank-connections`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userRef` | String | No | Filter by user reference |

**Request:**
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

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/bank-connections/fa519d92-778c-4b63-ad61-346ff443802c" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

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

**Error Responses:**

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

### Ingestions

#### Create Ingestion

Upload a PDF bank statement for processing.

**Endpoint:** `POST /v1/ingestions`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | PDF bank statement file (max 10MB) |
| `bankConnectionId` | UUID (query) | Yes | Bank connection ID |

**Request:**
```bash
curl -X POST "https://api.asp-platform.com/v1/ingestions?bankConnectionId=fa519d92-778c-4b63-ad61-346ff443802c" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..." \
  -F "file=@statement.pdf"
```

**Response:** `201 Created`

```json
{
  "id": "df989955-3ac5-4dee-a5d7-61b7060b0ac1",
  "bankConnectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Ingestion identifier |
| `bankConnectionId` | UUID | Bank connection ID |
| `userRef` | String | User reference |
| `status` | String | Processing status (see Status Values below) |
| `source` | String | Source type (always `"PDF_UPLOAD"`) |
| `ingestionType` | String | Ingestion type (always `"PDF"`) |
| `originalFileName` | String \| null | Original file name |
| `fileSize` | Number \| null | File size in bytes |
| `storagePath` | String \| null | Storage path (internal) |
| `errorCode` | String \| null | Error code if failed |
| `errorMessage` | String \| null | Error message if failed |
| `createdAt` | String | Creation timestamp (ISO 8601) |
| `updatedAt` | String | Last update timestamp (ISO 8601) |
| `processedAt` | String \| null | Processing completion timestamp (ISO 8601) |

**Status Values:**

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

**404 Not Found** - Bank connection not found
```json
{
  "error": {
    "code": "BANK_CONNECTION_NOT_FOUND",
    "message": "Bank connection not found"
  }
}
```

**413 Payload Too Large** - File exceeds size limit
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 10MB limit"
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

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/ingestions/df989955-3ac5-4dee-a5d7-61b7060b0ac1" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
{
  "id": "df989955-3ac5-4dee-a5d7-61b7060b0ac1",
  "bankConnectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
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

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/ingestions?userRef=user_123" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
[
  {
    "id": "df989955-3ac5-4dee-a5d7-61b7060b0ac1",
    "bankConnectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
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

**Request:**
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
    "bankConnectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
    "userRef": "user_123",
    "updatedAt": "2025-11-29T15:15:20Z"
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Account identifier |
| `accountNumber` | String | Account number |
| `iban` | String \| null | IBAN if available |
| `accountType` | String | Account type (e.g., "CHECKING", "SAVINGS") |
| `currency` | String | Currency code (e.g., "MAD") |
| `balance` | Number | Current balance |
| `bankConnectionId` | UUID | Bank connection ID |
| `userRef` | String | User reference |
| `updatedAt` | String | Last update timestamp (ISO 8601) |

---

#### Get Account

Get a specific account by ID.

**Endpoint:** `GET /v1/accounts/{accountId}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountId` | UUID | Account ID |

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/accounts/a1b2c3d4-e5f6-4789-a012-3456789abcde" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
  "accountNumber": "1234567890",
  "iban": "MA123456789012345678901234",
  "accountType": "CHECKING",
  "currency": "MAD",
  "balance": 12500.50,
  "bankConnectionId": "fa519d92-778c-4b63-ad61-346ff443802c",
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
| `startDate` | Date (ISO) | No | - | Filter transactions from this date (inclusive) |
| `endDate` | Date (ISO) | No | - | Filter transactions until this date (inclusive) |
| `limit` | Integer | No | 100 | Maximum number of transactions to return (max 1000) |
| `offset` | Integer | No | 0 | Number of transactions to skip |
| `category` | String | No | - | Filter by category (exact match) |
| `merchant` | String | No | - | Filter by merchant name (exact match) |

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/accounts/a1b2c3d4-e5f6-4789-a012-3456789abcde/transactions?startDate=2025-11-01&limit=50&category=Subscriptions" \
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | UUID | Account ID |
| `transactions` | Array | List of transactions |
| `pagination` | Object | Pagination information |

**Transaction Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Transaction identifier |
| `date` | String | Transaction date (ISO 8601 date) |
| `description` | String | Cleaned description |
| `rawDescription` | String | Original description from statement |
| `amount` | Number | Transaction amount (negative for debits, positive for credits) |
| `currency` | String | Currency code |
| `category` | String \| null | Transaction category |
| `merchant` | String \| null | Merchant name |

**Pagination Object:**

| Field | Type | Description |
|-------|------|-------------|
| `limit` | Integer | Number of items per page |
| `offset` | Integer | Number of items skipped |
| `total` | Integer | Total number of transactions matching filters |

**Notes:**
- Transactions are ordered by date (newest first)
- Date filters are inclusive
- Category and merchant filters use exact match (case-sensitive)
- Maximum `limit` is 1000

---

#### Get Account Enriched Transactions

Get paginated enriched transactions for an account with full enrichment data including metadata, fuzzy matching scores, and advanced categorization.

**Endpoint:** `GET /v1/accounts/{accountId}/enriched-transactions`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountId` | UUID | Account ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | Date (ISO) | No | - | Filter transactions from this date (inclusive) |
| `endDate` | Date (ISO) | No | - | Filter transactions until this date (inclusive) |
| `limit` | Integer | No | 100 | Maximum number of transactions to return (max 1000) |
| `offset` | Integer | No | 0 | Number of transactions to skip |
| `category` | String | No | - | Filter by category (exact match) |
| `subcategory` | String | No | - | Filter by subcategory (exact match) |
| `merchant` | String | No | - | Filter by normalized merchant name (exact match) |
| `direction` | String | No | - | Filter by direction: `INCOME` or `EXPENSE` |
| `salary` | Boolean | No | - | Filter by salary transactions (`true` or `false`) |
| `recurring` | Boolean | No | - | Filter by recurring transactions (`true` or `false`) |

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/accounts/a1b2c3d4-e5f6-4789-a012-3456789abcde/enriched-transactions?startDate=2025-11-01&limit=50&category=Subscriptions&direction=EXPENSE" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
{
  "accountId": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
  "transactions": [
    {
      "id": "e1b2c3d4-e5f6-4789-a012-3456789abcde",
      "normalizedTransactionId": "t1b2c3d4-e5f6-4789-a012-3456789abcde",
      "date": "2025-11-15",
      "descriptionRaw": "08/0908/09 PAIEMENT INTERNET INTERNATIONAL CARTE0332 APPLE.COM BI 28,04",
      "descriptionClean": "PAIEMENT INTERNET APPLE.COM",
      "category": "Subscriptions",
      "subcategory": "Apple",
      "merchantName": "Apple",
      "merchantNormalized": "apple",
      "salary": false,
      "recurring": true,
      "recurringGroupId": "r1b2c3d4-e5f6-4789-a012-3456789abcde",
      "direction": "EXPENSE",
      "amount": -28.04,
      "amountAbs": 28.04,
      "currency": "MAD",
      "metadata": {
        "fuzzy_used": false,
        "merchant_dict_used": true,
        "merchant_canonical": "apple",
        "merchant_dict_display": "Apple",
        "merchant_normalized_raw": "apple",
        "category_pattern": "APPLE",
        "category_confidence": "HIGH",
        "category_priority": 100
      }
    },
    {
      "id": "e2b2c3d4-e5f6-4789-a012-3456789abcde",
      "normalizedTransactionId": "t2b2c3d4-e5f6-4789-a012-3456789abcde",
      "date": "2025-11-14",
      "descriptionRaw": "GLOVO PZ 45,50",
      "descriptionClean": "GLOVO PZ",
      "category": "Food Delivery",
      "subcategory": "Glovo",
      "merchantName": "Glovo",
      "merchantNormalized": "glovo",
      "salary": false,
      "recurring": false,
      "recurringGroupId": null,
      "direction": "EXPENSE",
      "amount": -45.50,
      "amountAbs": 45.50,
      "currency": "MAD",
      "metadata": {
        "fuzzy_used": false,
        "merchant_dict_used": true,
        "merchant_canonical": "glovo",
        "merchant_dict_display": "Glovo",
        "merchant_normalized_raw": "glovo",
        "category_pattern": "GLOVO",
        "category_confidence": "HIGH",
        "category_priority": 100
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 125
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | UUID | Account ID |
| `transactions` | Array | List of enriched transactions |
| `pagination` | Object | Pagination information |

**Enriched Transaction Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Enriched transaction identifier |
| `normalizedTransactionId` | UUID | Reference to normalized transaction |
| `date` | String | Transaction date (ISO 8601 date) |
| `descriptionRaw` | String | Original description from statement |
| `descriptionClean` | String \| null | Cleaned description |
| `category` | String \| null | Transaction category |
| `subcategory` | String \| null | Transaction subcategory |
| `merchantName` | String \| null | Display merchant name (from dictionary) |
| `merchantNormalized` | String \| null | Normalized merchant identifier |
| `salary` | Boolean | Whether this is a salary transaction |
| `recurring` | Boolean | Whether this is a recurring transaction |
| `recurringGroupId` | UUID \| null | Group ID for recurring transactions |
| `direction` | String | Transaction direction: `INCOME` or `EXPENSE` |
| `amount` | Number | Transaction amount (signed: negative for debits, positive for credits) |
| `amountAbs` | Number | Absolute transaction amount |
| `currency` | String | Currency code |
| `metadata` | Object | Enrichment metadata (see Metadata Fields below) |

**Metadata Fields:**

The `metadata` object contains enrichment processing information:

| Field | Type | Description |
|-------|------|-------------|
| `fuzzy_used` | Boolean | Whether fuzzy matching was used |
| `fuzzy_score` | Number | Fuzzy matching score (0.0-1.0) if used |
| `fuzzy_candidate` | String | Fuzzy matched merchant candidate |
| `fuzzy_confidence` | String | Fuzzy match confidence: `HIGH`, `MEDIUM`, `LOW` |
| `merchant_dict_used` | Boolean | Whether merchant dictionary was used |
| `merchant_canonical` | String | Canonical merchant identifier from dictionary |
| `merchant_dict_display` | String | Display name from dictionary |
| `merchant_normalized_raw` | String | Raw normalized merchant before dictionary |
| `category_pattern` | String | Category rule pattern that matched |
| `category_confidence` | String | Category confidence: `HIGH`, `MEDIUM`, `LOW` |
| `category_priority` | Number | Category rule priority |

**Notes:**
- Transactions are ordered by date (newest first)
- Date filters are inclusive
- All filters use exact match (case-sensitive)
- Maximum `limit` is 1000
- `metadata` contains processing details that may vary per transaction
- Use this endpoint when you need full enrichment data including fuzzy matching scores, dictionary usage, and advanced categorization

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

**400 Bad Request** - Invalid parameters
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "startDate must be before or equal to endDate"
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

**Request:**
```bash
curl -X GET "https://api.asp-platform.com/v1/accounts/a1b2c3d4-e5f6-4789-a012-3456789abcde/snapshots" \
  -H "X-Api-Key: asp_live_sk_abc123xyz_..."
```

**Response:** `200 OK`

```json
[
  {
    "date": "2025-11-29",
    "balance": 12500.50,
    "ingestionId": "df989955-3ac5-4dee-a5d7-61b7060b0ac1"
  },
  {
    "date": "2025-11-15",
    "balance": 12800.00,
    "ingestionId": "df989955-3ac5-4dee-a5d7-61b7060b0ac1"
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `date` | String | Snapshot date (ISO 8601 date) |
| `balance` | Number | Account balance on this date |
| `ingestionId` | UUID | Ingestion ID that provided this snapshot |

**Notes:**
- Snapshots are ordered by date (newest first)
- One snapshot per ingestion per account

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

**Request:**
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | API key identifier |
| `prefix` | String | Key prefix (for identification) |
| `apiKey` | String | Full API key (shown only once) |

**⚠️ Important:** The full API key (`apiKey` field) is shown **only once** in this response. Store it securely. Subsequent calls to list API keys will only show the prefix.

**Error Responses:**

**400 Bad Request** - Validation error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "tenantId is required"
  }
}
```

---

#### List API Keys

List all API keys for the authenticated tenant.

**Endpoint:** `GET /v1/api-keys`

**Authentication:** Required

**Request:**
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | API key identifier |
| `displayName` | String | Human-readable name |
| `prefix` | String | Key prefix |
| `scopes` | Array[String] | Permissions |
| `sandbox` | Boolean | Whether this is a sandbox key |
| `createdAt` | String | Creation timestamp (ISO 8601) |
| `lastUsedAt` | String \| null | Last usage timestamp (ISO 8601) |

**Note:** The full API key is never returned in list responses for security reasons.

---

#### Delete API Key

Delete an API key. The key will immediately stop working.

**Endpoint:** `DELETE /v1/api-keys/{id}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | API Key ID |

**Request:**
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

**Error Responses:**

**404 Not Found** - API key not found
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

### Ingestion Status Flow

```
PENDING → PROCESSING → PARSED → SAVING → PROCESSED
                ↓
              FAILED
```

### Ingestion Status Values

| Status | Description | Next Possible Status |
|--------|-------------|---------------------|
| `PENDING` | Uploaded, waiting for processing | `PROCESSING`, `FAILED` |
| `PROCESSING` | Currently being processed | `PARSED`, `FAILED` |
| `PARSED` | Text extracted, bank detected, transactions parsed | `SAVING`, `FAILED` |
| `SAVING` | Writing to database | `PROCESSED`, `FAILED` |
| `PROCESSED` | Successfully completed | - (final state) |
| `FAILED` | Processing failed | - (check `errorCode` and `errorMessage`) |

### Common Error Codes

| Error Code | Description | Recoverable |
|------------|-------------|-------------|
| `UPLOAD_FAILED` | Failed to upload PDF to storage | Yes |
| `TEXT_EXTRACTION_FAILED` | Could not extract text from PDF | Yes (if PDF is valid) |
| `DETECTION_UNKNOWN_BANK` | Could not identify bank from statement | No |
| `PARSING_FAILED` | Failed to parse transactions | No |
| `ENRICHMENT_FAILED` | Failed to enrich transactions | Yes |
| `STORAGE_ERROR` | Database or storage error | Yes |

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

### HTTP Status Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| `200 OK` | Request successful | GET requests |
| `201 Created` | Resource created | POST requests |
| `400 Bad Request` | Invalid request | Validation errors |
| `401 Unauthorized` | Authentication failed | Missing/invalid API key |
| `404 Not Found` | Resource not found | Invalid ID |
| `413 Payload Too Large` | File too large | PDF > 10MB |
| `500 Internal Server Error` | Server error | Unexpected errors |

### Authentication Errors

**Status:** `401 Unauthorized`

```json
{
  "error": "invalid_api_key"
}
```

**Note:** Authentication errors use a simplified format (string instead of object) for security reasons.

### Validation Errors

**Status:** `400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "userRef",
      "reason": "userRef is required"
    }
  }
}
```

### Not Found Errors

**Status:** `404 Not Found`

```json
{
  "error": {
    "code": "INGESTION_NOT_FOUND",
    "message": "Ingestion not found"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_api_key` | 401 | Missing or invalid API key |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INGESTION_NOT_FOUND` | 404 | Ingestion not found |
| `ACCOUNT_NOT_FOUND` | 404 | Account not found |
| `BANK_NOT_FOUND` | 404 | Bank not found |
| `BANK_CONNECTION_NOT_FOUND` | 404 | Bank connection not found |
| `API_KEY_NOT_FOUND` | 404 | API key not found |
| `FILE_TOO_LARGE` | 413 | File size exceeds 10MB limit |
| `UPLOAD_FAILED` | 500 | Failed to upload file |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Rate Limits

**Current:** No rate limits (subject to change)

**Future:** Rate limits will be communicated via headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```

---

## TypeScript Definitions

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

export type BankConnectionStatus = 
  | 'CONNECTED' 
  | 'PENDING' 
  | 'WAITING_UPLOAD'
  | 'WAITING_OAUTH'
  | 'FAILED';

// ============================================
// Bank Types
// ============================================

export interface Bank {
  id: UUID;
  code: string;
  name: string;
  logoUrl: string | null;
  country: string;
  active: boolean;
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
// Ingestion Types
// ============================================

export interface Ingestion {
  id: UUID;
  bankConnectionId: UUID;
  userRef: string;
  status: IngestionStatus;
  source: string;
  ingestionType: string;
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
  date: string; // ISO 8601 date
  balance: number;
  ingestionId: UUID;
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

export interface EnrichedTransaction {
  id: UUID;
  normalizedTransactionId: UUID;
  date: string; // ISO 8601 date
  descriptionRaw: string;
  descriptionClean: string | null;
  category: string | null;
  subcategory: string | null;
  merchantName: string | null;
  merchantNormalized: string | null;
  salary: boolean;
  recurring: boolean;
  recurringGroupId: UUID | null;
  direction: 'INCOME' | 'EXPENSE';
  amount: number; // Signed: negative for debits, positive for credits
  amountAbs: number;
  currency: string;
  metadata: Record<string, any>; // Enrichment metadata
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
}

export interface PaginatedTransactions {
  accountId: UUID;
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export interface PaginatedEnrichedTransactions {
  accountId: UUID;
  transactions: EnrichedTransaction[];
  pagination: PaginationInfo;
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
// Response Types
// ============================================

export interface PingResponse {
  status: 'ok';
  tenantId: UUID | null;
}
```

---

## Quick Reference

### Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/v1/ping` | Health check | Optional |
| `GET` | `/v1/banks` | List banks | Required |
| `POST` | `/v1/bank-connections/{bankId}/connect` | Create connection | Required |
| `GET` | `/v1/bank-connections` | List connections | Required |
| `GET` | `/v1/bank-connections/{id}` | Get connection | Required |
| `POST` | `/v1/ingestions` | Upload PDF | Required |
| `GET` | `/v1/ingestions` | List ingestions | Required |
| `GET` | `/v1/ingestions/{id}` | Get ingestion | Required |
| `GET` | `/v1/accounts` | List accounts | Required |
| `GET` | `/v1/accounts/{id}` | Get account | Required |
| `GET` | `/v1/accounts/{id}/transactions` | Get transactions | Required |
| `GET` | `/v1/accounts/{id}/enriched-transactions` | Get enriched transactions | Required |
| `GET` | `/v1/accounts/{id}/snapshots` | Get snapshots | Required |
| `POST` | `/v1/api-keys` | Create API key | Required |
| `GET` | `/v1/api-keys` | List API keys | Required |
| `DELETE` | `/v1/api-keys/{id}` | Delete API key | Required |

---

## Support

- **Documentation:** https://docs.asp-platform.com
- **Status Page:** https://status.asp-platform.com
- **Support Email:** support@asp-platform.com

---

**Last Updated:** December 4, 2024  
**Document Version:** 1.0

