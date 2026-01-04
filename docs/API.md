# API Reference

This document describes the API endpoints available in the application.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-app.vercel.app/api`

## Authentication

Most endpoints require authentication via Supabase Auth.

```bash
# Include auth token in requests
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://your-app.vercel.app/api/v1/resource
```

Get access token from Supabase client:
```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* resource data */ },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "errors": {
      "field": ["Validation error message"]
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_abc123"
}
```

## Endpoints

### Health Check

Check system health status.

```
GET /api/health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "checks": [
    {
      "name": "database",
      "status": "pass",
      "responseTime": 45
    }
  ]
}
```

| Status Code | Meaning |
|-------------|---------|
| 200 | All checks passed |
| 503 | One or more checks failed |

---

### Example CRUD Endpoint

> Replace this section with your actual API endpoints.

#### List Resources

```
GET /api/v1/resources
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `sort` | string | "created_at" | Sort field |
| `order` | string | "desc" | Sort order (asc/desc) |

**Response**:
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Resource 1" },
    { "id": "2", "name": "Resource 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

#### Get Single Resource

```
GET /api/v1/resources/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Resource 1",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Resource

```
POST /api/v1/resources
```

**Request Body**:
```json
{
  "name": "New Resource",
  "description": "Optional description"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "New Resource",
    "description": "Optional description",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Resource

```
PATCH /api/v1/resources/:id
```

**Request Body**:
```json
{
  "name": "Updated Name"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Updated Name",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Delete Resource

```
DELETE /api/v1/resources/:id
```

**Response** (204 No Content): Empty response

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Not authorized for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down |

## Rate Limiting

API endpoints are rate limited to prevent abuse.

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 requests | 1 minute |
| Authenticated | 1000 requests | 1 minute |
| Auth endpoints | 10 requests | 1 minute |

**Rate limit headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

When rate limited, you'll receive:
```json
{
  "success": false,
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMITED",
    "statusCode": 429
  }
}
```

## Pagination

List endpoints support pagination:

```bash
# Get page 2 with 20 items per page
GET /api/v1/resources?page=2&limit=20
```

Response includes pagination metadata:
```json
{
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

## Filtering & Sorting

```bash
# Filter by status
GET /api/v1/resources?status=active

# Sort by name ascending
GET /api/v1/resources?sort=name&order=asc

# Combine filters
GET /api/v1/resources?status=active&sort=created_at&order=desc
```

## Webhooks

> Document any webhooks your application sends here.

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DATABASE.md](./DATABASE.md) - Schema documentation
