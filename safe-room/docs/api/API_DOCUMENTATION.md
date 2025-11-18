# Fitness Gym API Documentation

> **Version**: 1.0.0
> **Generated**: 2025-11-18T09:00:27.747Z
> **Base URL**: `http://localhost:8080/springboot1ngh61a2`

## Table of Contents

- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

---

## API Endpoints

## Data Models

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login

```bash
POST /springboot1ngh61a2/user/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### Using JWT Token

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

## Error Handling

The API returns standardized error responses:

```json
{
  "code": 400,
  "message": "Bad Request",
  "data": null
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Code Documentation

Found 0 documented classes and methods in the codebase.

### Classes: 0
### Methods: 0

---

*Generated automatically by API documentation generator v1.0.0*
