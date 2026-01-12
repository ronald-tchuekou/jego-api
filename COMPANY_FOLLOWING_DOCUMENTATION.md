# Company Following Documentation

This document describes the Company Following module, which allows users to follow companies and retrieve
following/follower information.

## REST API Endpoints

All endpoints are prefixed with `/v1/company-following` and require authentication.

### Get User Following Status

Returns whether a specific user follows a specific company.

`GET /v1/company-following/:companyId/:userId`

**Response (200 OK):**

```json
{
  "data": {
    "userId": "user-uuid",
    "companyId": "company-uuid",
    "createdAt": "2024-01-12T09:00:00Z",
    "updatedAt": "2024-01-12T09:00:00Z"
  }
}
```

### Get Company Followers

Returns a paginated list of users following a specific company.

`GET /v1/company-following/followers/:companyId`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search string to filter followers by name, email, etc.

**Response (200 OK):**

```json
{
  "meta": {
    "total": 1,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 1,
    "firstPage": 1,
    "firstPageUrl": "/?page=1",
    "lastPageUrl": "/?page=1",
    "nextPageUrl": null,
    "previousPageUrl": null
  },
  "data": [
    {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "..." : "..."
    }
  ]
}
```

### Get User Followings

Returns a paginated list of companies followed by a specific user.

`GET /v1/company-following/user/:userId`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search string to filter companies by name, description, email, phone, or city.

**Response (200 OK):**

```json
{
  "meta": {
    "total": 1,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 1,
    "firstPage": 1,
    "firstPageUrl": "/?page=1",
    "lastPageUrl": "/?page=1",
    "nextPageUrl": null,
    "previousPageUrl": null
  },
  "data": [
    {
      "id": "company-uuid",
      "name": "Company Name",
      "description": "Company Description",
      "category": {
        "id": "category-uuid",
        "name": "Category Name"
      },
      "..." : "..."
    }
  ]
}
```

### Follow a Company

Allows the authenticated user to follow a company.

`PATCH /v1/company-following/:companyId`

**Response (201 Created):**

```json
{
  "data": {
    "userId": "auth-user-uuid",
    "companyId": "company-uuid",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Unfollow a Company

Allows the authenticated user to unfollow a company.

`DELETE /v1/company-following/:companyId`

**Response (200 OK):**

```json
{
  "message": "Following supprimé avec succès"
}
```
