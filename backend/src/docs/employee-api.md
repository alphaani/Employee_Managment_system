# Employee Module — API Documentation

> **Base URL:** `/api/employees`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Content-Type:** `application/json`

---

## Endpoint Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/employees` | Yes | Admin | List all employees (paginated, searchable, filterable) |
| GET | `/employees/:id` | Yes | Admin | Get single employee by ID |
| POST | `/employees` | Yes | Admin | Create a new employee |
| PUT | `/employees/:id` | Yes | Admin | Update any employee |
| DELETE | `/employees/:id` | Yes | Admin | Delete employee + cascade related records |
| GET | `/employees/profile` | Yes | Employee | Get own profile |
| PUT | `/employees/profile` | Yes | Employee | Update own profile (limited fields) |

---

## 1. GET /employees — List Employees

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 10 | Items per page (max 100) |
| `search` | String | — | Searches fullName, email, position, phoneNumber |
| `departmentId` | ObjectId | — | Filter by department |
| `status` | Enum | — | `active` or `inactive` |
| `gender` | Enum | — | `Male`, `Female`, or `Other` |
| `position` | String | — | Filter by position (partial match) |
| `sortBy` | String | `createdAt` | Field to sort by |
| `order` | Enum | `desc` | `asc` or `desc` |

### Response

```json
{
  "success": true,
  "message": "Employees fetched successfully",
  "data": [
    {
      "_id": "665a1b2c3d4e5f6a7b8c9d0e",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "gender": "Male",
      "position": "Software Engineer",
      "departmentId": {
        "_id": "665a1b2c3d4e5f6a7b8c9d0f",
        "departmentName": "Engineering"
      },
      "salary": 75000,
      "profileImage": "",
      "joiningDate": "2024-01-15T00:00:00.000Z",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-06-25T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## 2. GET /employees/:id — Get Employee

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Employee ID |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "gender": "Male",
    "position": "Software Engineer",
    "departmentId": {
      "_id": "665a1b2c3d4e5f6a7b8c9d0f",
      "departmentName": "Engineering"
    },
    "salary": 75000,
    "profileImage": "",
    "joiningDate": "2024-01-15T00:00:00.000Z",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-06-25T12:00:00.000Z"
  }
}
```

### Error — Not Found

```json
{
  "success": false,
  "error": "Employee not found",
  "statusCode": 404
}
```

---

## 3. POST /employees — Create Employee

### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `fullName` | String | Yes | — | 2–100 characters |
| `email` | String | Yes | — | Must be unique, valid format |
| `password` | String | Yes | — | Min 6 characters |
| `phoneNumber` | String | No | — | Valid phone format |
| `gender` | String | No | — | `Male`, `Female`, or `Other` |
| `position` | String | No | — | Max 100 characters |
| `departmentId` | ObjectId | No | — | Valid Department ObjectId |
| `salary` | Number | No | — | Must be >= 0 |
| `status` | String | No | `active` | `active` or `inactive` |
| `joiningDate` | Date | No | today | ISO date string |

### Example Request

```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePass123",
  "phoneNumber": "+9876543210",
  "gender": "Female",
  "position": "Product Manager",
  "departmentId": "665a1b2c3d4e5f6a7b8c9d0f",
  "salary": 85000,
  "status": "active"
}
```

### Response — 201 Created

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "665a1b2c3d4e5f6a7b8c9d10",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+9876543210",
    "gender": "Female",
    "position": "Product Manager",
    "departmentId": {
      "_id": "665a1b2c3d4e5f6a7b8c9d0f",
      "departmentName": "Engineering"
    },
    "salary": 85000,
    "profileImage": "",
    "joiningDate": "2025-06-25T00:00:00.000Z",
    "status": "active",
    "createdAt": "2025-06-25T12:00:00.000Z",
    "updatedAt": "2025-06-25T12:00:00.000Z"
  }
}
```

### Error — Duplicate Email

```json
{
  "success": false,
  "error": "Employee with this email already exists",
  "statusCode": 409
}
```

### Error — Validation Failed

```json
{
  "success": false,
  "error": "Validation failed"
}
```

---

## 4. PUT /employees/:id — Update Employee

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Employee ID |

### Request Body (all fields optional)

| Field | Type | Description |
|-------|------|-------------|
| `fullName` | String | 2–100 characters |
| `email` | String | Must be unique, valid format |
| `phoneNumber` | String | Valid phone format |
| `gender` | String | `Male`, `Female`, or `Other` |
| `position` | String | Max 100 characters |
| `departmentId` | ObjectId | Valid Department ObjectId |
| `salary` | Number | Must be >= 0 |
| `status` | String | `active` or `inactive` |

### Example Request

```json
{
  "position": "Senior Product Manager",
  "salary": 95000,
  "status": "active"
}
```

### Response

```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": { "...": "updated employee object" }
}
```

---

## 5. DELETE /employees/:id — Delete Employee

### Description

Deletes the employee AND all related records:
- Attendance records for this employee
- Payroll records for this employee
- Leave requests for this employee
- Performance evaluations for this employee

### Response

```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## 6. GET /employees/profile — Get Own Profile (Employee)

### Description

Returns the authenticated employee's full profile.  
**Role required:** `employee`

### Response

```json
{
  "success": true,
  "data": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "gender": "Male",
    "position": "Software Engineer",
    "departmentId": {
      "_id": "665a1b2c3d4e5f6a7b8c9d0f",
      "departmentName": "Engineering"
    },
    "salary": 75000,
    "profileImage": "",
    "joiningDate": "2024-01-15T00:00:00.000Z",
    "status": "active"
  }
}
```

---

## 7. PUT /employees/profile — Update Own Profile (Employee)

### Description

Employee updates their own profile. Only the following fields can be modified:

| Field | Type | Description |
|-------|------|-------------|
| `fullName` | String | 2–100 characters |
| `phoneNumber` | String | Valid phone format |
| `gender` | String | `Male`, `Female`, or `Other` |
| `profileImage` | String | Cloudinary URL |

Fields like `salary`, `position`, `status`, `departmentId`, and `email` are **not** modifiable by the employee.

### Example Request

```json
{
  "fullName": "John Updated",
  "phoneNumber": "+1112223333",
  "gender": "Male"
}
```

### Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "...": "updated employee object" }
}
```

---

## Error Reference

| Status | Error | When |
|--------|-------|------|
| 400 | `Validation failed` | Request body fails validation rules |
| 401 | `Not authorized. No token provided.` | Missing or invalid JWT |
| 403 | `Not authorized to access this resource.` | Wrong role for endpoint |
| 404 | `Employee not found` | Invalid employee ID |
| 409 | `Employee with this email already exists` | Duplicate email on create |
| 500 | `Something went wrong.` | Unexpected server error |
