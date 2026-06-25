# Employee Management System — Architecture Document

> **Author:** Senior MERN Stack Architect  
> **Stack:** React + Vite + Tailwind CSS | Node.js + Express | MongoDB Atlas | JWT | Cloudinary | Vercel

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [API Design Plan](#5-api-design-plan)
6. [Database Relationship Diagram](#6-database-relationship-diagram)
7. [Clean Code Principles](#7-clean-code-principles)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite + Tailwind CSS)                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │  Pages   │  │Components│  │ Services │  │ Context  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS / REST API
                           │ JWT in Authorization Header
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                             │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Routes  │→│Controllers│→│ Services │→│  Models  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│       │                                                            │
│       ▼                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│  │Middleware │  │  Config  │  │  Utils   │                         │
│  │(Auth/Error│  │(DB/JWT/  │  │(AppError/│                         │
│  │ /Upload)  │  │Cloudinary)│  │catchAsync)│                        │
│  └──────────┘  └──────────┘  └──────────┘                         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │employees │  │departments│ │attendances│  │  leaves  │           │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤           │
│  │ payrolls │  │performances│ │  admins  │           │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External Services                                │
│  ┌──────────────────────┐  ┌────────────────────────────────────┐  │
│  │    Cloudinary         │  │    Vercel Deployment               │  │
│  │  (Image Uploads)      │  │  (Frontend + Backend)              │  │
│  └──────────────────────┘  └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.1 Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | React + Vite | Fast HMR, smaller bundle, modern tooling |
| Styling | Tailwind CSS | Utility-first, rapid UI, responsive out-of-box |
| State Management | React Context + useState | Sufficient for this scope; avoids Redux overhead |
| HTTP Client | Axios | Interceptors for JWT, cleaner API than fetch |
| Charts | Recharts | React-native, declarative, lightweight |
| Animations | Framer Motion | Declarative animations, gesture support |
| Backend Pattern | Layered (Routes → Controllers → Services → Models) | Separation of concerns, testability |
| Auth | JWT (access + refresh tokens) | Stateless, scalable |
| File Upload | Multer → Cloudinary | No local storage needed, CDN-delivered |
| Database | MongoDB Atlas + Mongoose | Schema flexibility, free tier, managed |
| Password Hashing | bcryptjs | Industry standard |
| Deployment | Vercel (monorepo or separate) | Zero-config, auto SSL, serverless support |

---

## 2. Project Folder Structure

### 2.1 Full Tree

```
D:\Employee Management System\
│
├── Frontend/                              # React + Vite SPA
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   │       └── default-avatar.png
│   │
│   ├── src/
│   │   ├── assets/                        # Static assets (SVGs, illustrations)
│   │   │   └── illustrations/
│   │   │
│   │   ├── components/                    # Shared/reusable UI components
│   │   │   ├── ui/                        # Atomic design primitives
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── index.js              # Barrel export
│   │   │   │
│   │   │   ├── layout/                    # Layout components
│   │   │   │   ├── RootLayout.jsx         # Main app shell
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── ProtectedRoute.jsx     # Auth guard
│   │   │   │
│   │   │   ├── charts/                    # Recharts wrappers
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── forms/                     # Domain-specific forms
│   │   │       ├── EmployeeForm.jsx
│   │   │       ├── DepartmentForm.jsx
│   │   │       ├── LeaveRequestForm.jsx
│   │   │       └── PayrollForm.jsx
│   │   │
│   │   ├── pages/                         # Route-level page components
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeListPage.jsx
│   │   │   │   ├── EmployeeDetailPage.jsx
│   │   │   │   └── EmployeeFormPage.jsx   # Create/Edit
│   │   │   │
│   │   │   ├── departments/
│   │   │   │   ├── DepartmentListPage.jsx
│   │   │   │   └── DepartmentFormPage.jsx
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── AttendancePage.jsx      # Check-in/out view
│   │   │   │   └── AttendanceReportPage.jsx
│   │   │   │
│   │   │   ├── payroll/
│   │   │   │   ├── PayrollListPage.jsx
│   │   │   │   ├── PayrollDetailPage.jsx
│   │   │   │   └── PayrollFormPage.jsx
│   │   │   │
│   │   │   ├── leave/
│   │   │   │   ├── LeaveListPage.jsx
│   │   │   │   ├── LeaveRequestPage.jsx
│   │   │   │   └── LeaveApprovalPage.jsx   # Admin only
│   │   │   │
│   │   │   ├── performance/
│   │   │   │   ├── PerformanceListPage.jsx
│   │   │   │   └── PerformanceFormPage.jsx
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   └── ProfilePage.jsx
│   │   │   │
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── services/                      # API layer (Axios)
│   │   │   ├── api.js                     # Axios instance + interceptors
│   │   │   ├── auth.service.js
│   │   │   ├── employee.service.js
│   │   │   ├── department.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── payroll.service.js
│   │   │   ├── leave.service.js
│   │   │   ├── performance.service.js
│   │   │   └── dashboard.service.js
│   │   │
│   │   ├── context/                       # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── SidebarContext.jsx
│   │   │
│   │   ├── hooks/                         # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   ├── usePagination.js
│   │   │   └── useDebounce.js
│   │   │
│   │   ├── utils/                         # Helper functions
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   └── formatDate.js
│   │   │
│   │   ├── routes/                        # React Router config
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── styles/                        # Global styles
│   │   │   └── index.css
│   │   │
│   │   ├── App.jsx                        # Root component
│   │   └── main.jsx                       # Vite entry point
│   │
│   ├── .env                               # VITE_API_URL, etc.
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── backend/                               # Express.js API
│   ├── src/
│   │   ├── config/                        # Configuration modules
│   │   │   ├── db.js                      # MongoDB connection
│   │   │   ├── jwt.js                     # JWT helpers
│   │   │   ├── cloudinary.js              # Cloudinary config
│   │   │   └── cors.js                    # CORS options
│   │   │
│   │   ├── models/                        # Mongoose schemas
│   │   │   ├── Employee.js
│   │   │   ├── Department.js
│   │   │   ├── Attendance.js
│   │   │   ├── Payroll.js
│   │   │   ├── Leave.js
│   │   │   ├── Performance.js
│   │   │   └── Admin.js
│   │   │
│   │   ├── routes/                        # Express routers
│   │   │   ├── auth.routes.js
│   │   │   ├── employee.routes.js
│   │   │   ├── department.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── payroll.routes.js
│   │   │   ├── leave.routes.js
│   │   │   ├── performance.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── index.js                   # Route aggregator
│   │   │
│   │   ├── controllers/                   # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── department.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── payroll.controller.js
│   │   │   ├── leave.controller.js
│   │   │   ├── performance.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── services/                      # Business logic layer
│   │   │   ├── auth.service.js
│   │   │   ├── employee.service.js
│   │   │   ├── department.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── payroll.service.js
│   │   │   ├── leave.service.js
│   │   │   ├── performance.service.js
│   │   │   └── dashboard.service.js
│   │   │
│   │   ├── middleware/                    # Express middleware
│   │   │   ├── auth.middleware.js          # JWT verification
│   │   │   ├── admin.middleware.js         # Admin role check
│   │   │   ├── upload.middleware.js        # Multer config
│   │   │   ├── validate.middleware.js      # Request validation
│   │   │   └── error.middleware.js         # Global error handler
│   │   │
│   │   ├── utils/                         # Shared utilities
│   │   │   ├── AppError.js                # Custom error class
│   │   │   ├── catchAsync.js              # Async wrapper
│   │   │   ├── validators.js              # Joi/Zod schemas
│   │   │   └── helpers.js                 # Formatting utils
│   │   │
│   │   └── app.js                         # Express app setup
│   │
│   ├── server.js                          # Entry point
│   ├── .env                               # MONGO_URI, JWT_SECRET, etc.
│   ├── .env.example
│   ├── vercel.json                        # Vercel serverless config
│   └── package.json
│
├── architecture.md                        # This file
├── decomentation.md                        # Original project brief
├── Readme.md                              # Project overview
└── .gitignore
```

---

## 3. Frontend Architecture

### 3.1 Component Tree

```
<App>
  <AuthProvider>
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <AppRoutes>
            │
            ├── <RootLayout>                  # Protected routes
            │   ├── <Sidebar />               # Nav links by role
            │   ├── <Navbar />                # User menu, notifications
            │   └── <Outlet />                # Page content
            │       │
            │       ├── <DashboardPage />
            │       │   └── Charts (BarChart, PieChart, LineChart)
            │       │
            │       ├── <EmployeeListPage />
            │       │   ├── <Table /> + <Badge />
            │       │   └── <Modal /> (confirm delete)
            │       │
            │       ├── <EmployeeFormPage />
            │       │   └── <EmployeeForm />
            │       │       └── <Input />, <Select />, <Button />
            │       │
            │       ├── <AttendancePage />
            │       │   └── Check-in / Check-out buttons
            │       │
            │       ├── <LeaveListPage />
            │       │   ├── <Table />
            │       │   └── <Badge /> (status)
            │       │
            │       └── ... other pages
            │
            ├── <LoginPage />                # Public
            └── <RegisterPage />             # Public (admin-only)
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  </AuthProvider>
</App>
```

### 3.2 Routing & Access Control

| Route | Page | Auth | Role |
|-------|------|------|------|
| `/login` | LoginPage | No | — |
| `/register` | RegisterPage | Yes | Admin |
| `/dashboard` | DashboardPage | Yes | All |
| `/employees` | EmployeeListPage | Yes | Admin |
| `/employees/new` | EmployeeFormPage | Yes | Admin |
| `/employees/:id` | EmployeeDetailPage | Yes | All |
| `/employees/:id/edit` | EmployeeFormPage | Yes | Admin |
| `/departments` | DepartmentListPage | Yes | Admin |
| `/departments/new` | DepartmentFormPage | Yes | Admin |
| `/departments/:id/edit` | DepartmentFormPage | Yes | Admin |
| `/attendance` | AttendancePage | Yes | All |
| `/attendance/report` | AttendanceReportPage | Yes | Admin |
| `/payroll` | PayrollListPage | Yes | Admin |
| `/payroll/:id` | PayrollDetailPage | Yes | All |
| `/payroll/new` | PayrollFormPage | Yes | Admin |
| `/leaves` | LeaveListPage | Yes | All |
| `/leaves/new` | LeaveRequestPage | Yes | Employee |
| `/leaves/approvals` | LeaveApprovalPage | Yes | Admin |
| `/performance` | PerformanceListPage | Yes | All |
| `/performance/new` | PerformanceFormPage | Yes | Admin |
| `/profile` | ProfilePage | Yes | All |
| `*` | NotFoundPage | No | — |

**Guard implementation:** `ProtectedRoute` wraps `<Outlet>` inside `<RootLayout>`. It checks `AuthContext` — redirects to `/login` if unauthenticated. Role-based rendering occurs inside pages via `useAuth()`.

### 3.3 State Management Strategy

| State Type | Solution | Where |
|-----------|----------|-------|
| Auth state | React Context | `AuthContext` — user object, token, login/logout actions |
| UI state | React Context | `ThemeContext` (dark/light), `SidebarContext` (collapsed) |
| Server data | Component-local `useState` + `useFetch` hook | Each page fetches its own data |
| Form state | Component-local `useState` | Inside form components |

No Redux or Zustand — Context + hooks is sufficient for this scale. If the app grows, migration to Zustand is straightforward.

### 3.4 Data Flow Pattern

```
User Action
    │
    ▼
Page Component ──► Service Function ──► Axios Instance ──► Backend API
    │                                      │                    │
    │                               Interceptor adds       Processes request
    │                               Authorization: Bearer   │
    │                               <token>                 │
    │                                                       ▼
    │                                              Response / Error
    │                                                  │
    ▼                                                  ▼
Update state ◄─────── Handle response/error ◄───── Interceptor catches
(useState setter)                                   401 → auto-logout
```

### 3.5 Key Frontend Libraries

| Library | Purpose |
|---------|---------|
| `react-router-dom` (v6) | Client-side routing |
| `axios` | HTTP client with interceptors |
| `recharts` | Dashboard charts (bar, pie, line) |
| `framer-motion` | Page transitions, component animations |
| `react-icons` | Icon library |
| `react-hot-toast` | Toast notifications |
| `date-fns` | Date formatting/manipulation |
| `@headlessui/react` | Accessible dropdowns, modals |
| `tailwindcss` | Utility CSS framework |

---

## 4. Backend Architecture

### 4.1 Layered Architecture Pattern

```
┌──────────────────────────────────────────────────────────┐
│                      ROUTES                              │
│  Define HTTP methods & URL paths                         │
│  Attach middleware (auth, validation, upload)            │
│  Delegate to controllers                                │
│  e.g., router.get('/', authMiddleware, controller.getAll)│
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   CONTROLLERS                            │
│  Extract data from req (params, body, user)              │
│  Call service layer                                      │
│  Send response (res.status().json())                     │
│  NO business logic — thin layer                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    SERVICES                              │
│  All business logic lives here                           │
│  Database queries via Models                             │
│  Calculations (payroll, attendance stats)                │
│  Throws AppError for known failures                      │
│  Reusable across controllers                             │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                     MODELS                               │
│  Mongoose schema definitions                             │
│  Validation rules, default values                        │
│  Pre/post hooks (e.g., hash password before save)        │
│  Virtuals, indexes                                       │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Middleware Pipeline

```
Request
  │
  ▼
1. CORS (config/cors.js)
2. Body parser (express.json)
3. Morgan (request logging — dev only)
  │
  ▼
Route matched → middleware chain:
  │
  ├── auth.middleware.js     — verifies JWT, attaches req.user
  ├── admin.middleware.js    — checks req.user.role === 'admin'
  ├── upload.middleware.js   — Multer: parses multipart/form-data
  ├── validate.middleware.js — validates req.body against Joi/Zod schema
  │
  ▼
Controller → Service → Model → MongoDB
  │
  ▼
Response sent → or → error.middleware.js (4 params)
  │
  ▼
Client receives { success, data, message } or { success, error }
```

### 4.3 Error Handling Strategy

- **AppError** class extends `Error` with `statusCode` and `isOperational` flag.
- **catchAsync** wraps async route handlers, forwards errors to `next()`.
- **error.middleware.js** — global handler: distinguishes operational vs programming errors, returns consistent JSON shape.
- Mongoose `CastError` (invalid ObjectId), `ValidationError`, `11000` (duplicate key) are mapped to user-friendly messages.

### 4.4 Authentication Flow

```
Registration:
  Client ──POST /api/auth/register──► Controller
      │                                    │
      │                              Hash password (bcryptjs, 12 rounds)
      │                              Create Employee document
      │                              Generate JWT (payload: { id, role })
      │                                    │
      ◄─── { success: true, token, user } ─┘

Login:
  Client ──POST /api/auth/login──► Controller
      │                                    │
      │                              Find by email
      │                              Compare password (bcryptjs.compare)
      │                              Generate JWT
      │                                    │
      ◄─── { success: true, token, user } ─┘

Authenticated Request:
  Client ──GET /api/employees──► auth.middleware
      │                              │
      │                         Verify JWT
      │                         Attach decoded { id, role } to req.user
      │                              │
      ◄────────── response ──────────┘
```

### 4.5 File Upload Flow (Multer → Cloudinary)

```
Client sends FormData with profileImage field
  │
  ▼
upload.middleware.js (Multer)
  │  storage: memoryStorage (no disk write)
  │  fileFilter: images only (jpeg, png, gif, webp)
  │  limits: 2MB
  │
  ▼
Controller receives req.file (buffer + metadata)
  │
  ▼
cloudinary.uploader.upload_stream()
  │  folder: 'ems/profiles'
  │  transformation: { width: 300, height: 300, crop: 'fill' }
  │
  ▼
Cloudinary returns { public_id, secure_url }
  │
  ▼
Store secure_url in Employee.profileImage
```

---

## 5. API Design Plan

### 5.1 Base URL

```
Development: http://localhost:5000/api
Production:  https://ems-backend.vercel.app/api
```

### 5.2 Response Envelope

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Employees fetched successfully"
}

// List with pagination
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}

// Error
{
  "success": false,
  "error": "Employee not found",
  "statusCode": 404
}
```

### 5.3 Complete Endpoint Map

#### Authentication

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | Admin | Admin | Register new admin |
| POST | `/api/auth/login` | No | — | Login (email + password) |
| GET | `/api/auth/me` | Yes | All | Get current user profile |
| PUT | `/api/auth/update-password` | Yes | All | Change password |

#### Employees

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/employees` | Yes | Admin | List all employees (paginated, filterable) |
| GET | `/api/employees/:id` | Yes | All | Get single employee |
| POST | `/api/employees` | Yes | Admin | Create employee |
| PUT | `/api/employees/:id` | Yes | Admin | Update employee |
| PATCH | `/api/employees/:id/status` | Yes | Admin | Activate/deactivate employee |
| DELETE | `/api/employees/:id` | Yes | Admin | Delete employee |
| PUT | `/api/employees/profile` | Yes | Employee | Employee updates own profile |

**Query params for GET /api/employees:**
`?page=1&limit=10&search=John&department=deptId&status=active&sortBy=fullName&order=asc`

#### Departments

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/departments` | Yes | All | List all departments |
| GET | `/api/departments/:id` | Yes | All | Get single department (with employee count) |
| POST | `/api/departments` | Yes | Admin | Create department |
| PUT | `/api/departments/:id` | Yes | Admin | Update department |
| DELETE | `/api/departments/:id` | Yes | Admin | Delete department (only if no employees) |
| GET | `/api/departments/:id/employees` | Yes | All | List employees in department |

#### Attendance

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/attendance/check-in` | Yes | Employee | Record check-in |
| POST | `/api/attendance/check-out` | Yes | Employee | Record check-out |
| GET | `/api/attendance` | Yes | All | Get attendance records |
| GET | `/api/attendance/today` | Yes | Admin | Today's attendance overview |
| GET | `/api/attendance/my` | Yes | Employee | Current user's attendance |
| GET | `/api/attendance/report` | Yes | Admin | Monthly attendance report |

**Query params:** `?employeeId=xxx&from=2026-01-01&to=2026-06-25&status=present&page=1&limit=30`

#### Payroll

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/payroll` | Yes | Admin | List all payroll records |
| GET | `/api/payroll/:id` | Yes | All | Get single payslip |
| POST | `/api/payroll` | Yes | Admin | Generate payroll (auto-calculate) |
| PATCH | `/api/payroll/:id/status` | Yes | Admin | Update payment status |
| GET | `/api/payroll/my` | Yes | Employee | Current user's payslips |
| GET | `/api/payroll/report` | Yes | Admin | Payroll summary report |

#### Leave

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/leaves` | Yes | Admin | List all leave requests |
| GET | `/api/leaves/:id` | Yes | All | Get single leave request |
| POST | `/api/leaves` | Yes | Employee | Submit leave request |
| PATCH | `/api/leaves/:id/status` | Yes | Admin | Approve/reject leave |
| GET | `/api/leaves/my` | Yes | Employee | Current user's leaves |
| GET | `/api/leaves/balance` | Yes | Employee | Get leave balance |

**PATCH body:** `{ "status": "approved" | "rejected", "adminComment": "..." }`

#### Performance

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/performances` | Yes | Admin | List all evaluations |
| GET | `/api/performances/:id` | Yes | All | Get single evaluation |
| POST | `/api/performances` | Yes | Admin | Create evaluation |
| PUT | `/api/performances/:id` | Yes | Admin | Update evaluation |
| DELETE | `/api/performances/:id` | Yes | Admin | Delete evaluation |
| GET | `/api/performances/my` | Yes | Employee | Current user's evaluations |

#### Dashboard (Admin)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/admin/dashboard/stats` | Yes | Admin | Summary: counts, totals |
| GET | `/api/admin/dashboard/attendance-trends` | Yes | Admin | Attendance line chart data |
| GET | `/api/admin/dashboard/department-stats` | Yes | Admin | Dept-wise employee count |
| GET | `/api/admin/dashboard/payroll-summary` | Yes | Admin | Monthly payroll totals |
| GET | `/api/admin/dashboard/recent-activities` | Yes | Admin | Recent actions log |

#### Profile (Employee)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/profile` | Yes | Employee | Get own profile |
| PUT | `/api/profile` | Yes | Employee | Update own info (not salary/role) |
| POST | `/api/profile/upload-image` | Yes | Employee | Upload profile picture |

### 5.4 Naming Conventions

- **URLs:** `/api/resource-name` — plural, kebab-case
- **Query params:** `camelCase`
- **Request body:** `camelCase` (Mongoose transforms to `camelCase` via `transform` option)
- **Response:** `snake_case` for legacy compatibility OR `camelCase` — pick one, stay consistent. **Recommendation:** use `camelCase` throughout since the frontend is JS.

---

## 6. Database Relationship Diagram

### 6.1 Entity Relationship Diagram (Text)

```
┌──────────────────┐       ┌─────────────────────┐
│     DEPARTMENT    │       │       ADMIN          │
│──────────────────│       │─────────────────────│
│ PK departmentId  │       │ PK adminId           │
│ departmentName   │       │ fullName             │
│ description      │       │ email (unique)       │
│ manager          │       │ password (hashed)    │
│ createdAt        │       │ role                 │
│ updatedAt        │       │ createdAt            │
└────────┬─────────┘       └─────────────────────┘
         │
         │ 1 (has many)
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                          EMPLOYEE                                │
│──────────────────────────────────────────────────────────────────│
│ PK employeeId        (ObjectId, auto)                            │
│ FK departmentId      → Department.departmentId                   │
│──────────────────────────────────────────────────────────────────│
│ fullName                                                         │
│ email              (unique, indexed)                             │
│ password           (hashed, selected: false)                     │
│ phoneNumber                                                      │
│ gender             (enum: Male/Female/Other)                     │
│ position                                                         │
│ salary             (Number)                                      │
│ profileImage       (Cloudinary URL)                              │
│ joiningDate         (Date)                                       │
│ status             (enum: active/inactive, default: active)      │
│ role               (enum: employee/admin, default: employee)     │
│ createdAt                                                         │
│ updatedAt                                                         │
└───┬───────────────┬───────────────┬───────────────┬─────────────┘
    │               │               │               │
    │ 1 (has many)  │ 1 (has many)  │ 1 (has many)  │ 1 (has many)
    ▼               ▼               ▼               ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│ATTENDANCE│  │  PAYROLL │  │  LEAVE   │  │ PERFORMANCE  │
│──────────│  │──────────│  │──────────│  │──────────────│
│PK attId  │  │PK payId  │  │PK lvId   │  │PK perfId     │
│FK empId  │  │FK empId  │  │FK empId  │  │FK empId      │
│──────────│  │──────────│  │──────────│  │──────────────│
│checkInTm │  │basicSal  │  │leaveType │  │rating (1-5)  │
│checkOutTm│  │bonus     │  │startDate │  │feedback      │
│date      │  │deduction │  │endDate   │  │evalDate      │
│status    │  │totalSal  │  │reason    │  │createdAt     │
│createdAt │  │payDate   │  │status    │  │updatedAt     │
│updatedAt │  │status    │  │createdAt │  └──────────────┘
└──────────┘  │createdAt │  │updatedAt │
              │updatedAt │  └──────────┘
              └──────────┘

KEY:
PK  = Primary Key (MongoDB _id mapped to custom field)
FK  = Foreign Key (reference)
──►  = One-to-Many relationship
```

### 6.2 Mongoose Relationship Summary

| Model | Ref Field | References | Type | On Delete |
|-------|-----------|-----------|------|-----------|
| Employee | `departmentId` | Department | `ObjectId` (ref) | `null` on delete |
| Attendance | `employeeId` | Employee | `ObjectId` (ref) | Cascade delete |
| Payroll | `employeeId` | Employee | `ObjectId` (ref) | Cascade delete |
| Leave | `employeeId` | Employee | `ObjectId` (ref) | Cascade delete |
| Performance | `employeeId` | Employee | `ObjectId` (ref) | Cascade delete |

**Admin** is a standalone collection (not related to Employee). Admins manage the system.

### 6.3 Index Strategy

| Collection | Index | Type | Purpose |
|-----------|-------|------|---------|
| Employee | `email` | Unique | Login lookups |
| Employee | `departmentId` | Single | Filter by department |
| Employee | `status` | Single | Active/inactive filter |
| Attendance | `employeeId + date` | Compound | Daily attendance lookup (unique) |
| Attendance | `date` | Single | Daily reports |
| Payroll | `employeeId + paymentDate` | Compound | Payroll history |
| Leave | `employeeId + status` | Compound | Leave requests by employee |
| Leave | `status` | Single | Pending approvals |
| Performance | `employeeId + evaluationDate` | Compound | Evaluation history |
| Admin | `email` | Unique | Login lookups |

---

## 7. Clean Code Principles

### 7.1 General

| Principle | Application |
|-----------|-------------|
| **DRY** | Extract repeated logic into services, utils, and custom hooks |
| **KISS** | Keep functions small (< 30 lines), single responsibility |
| **YAGNI** | Don't add features/abstractions until needed |
| **Separation of Concerns** | Routes → Controllers → Services → Models (backend). Pages → Components → Services (frontend) |
| **Consistent Naming** | camelCase for JS/TS, PascalCase for components, kebab-case for files |
| **Fail Fast** | Validate inputs at the boundary (middleware), throw early |

### 7.2 Backend Conventions

```
// ✅ Controller: thin, delegates to service
exports.getAllEmployees = catchAsync(async (req, res) => {
  const result = await employeeService.getAllEmployees(req.query);
  res.status(200).json({ success: true, ...result });
});

// ✅ Service: business logic, throws AppError
const getAllEmployees = async (query) => {
  const { page = 1, limit = 10, search, department, status } = query;
  const filter = {};
  if (search) filter.fullName = { $regex: search, $options: 'i' };
  if (department) filter.departmentId = department;
  if (status) filter.status = status;
  // ... pagination logic
  return { data, pagination };
};

// ✅ Model: schema + indexes only
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ❌ Anti-pattern: business logic in controller
exports.getAllEmployees = async (req, res) => {
  const employees = await Employee.find(req.query).populate('departmentId');
  // ... manual pagination, filtering, error handling in controller
};
```

### 7.3 Frontend Conventions

```
// ✅ Page: minimal, delegates to components and hooks
const EmployeeListPage = () => {
  const { user } = useAuth();
  const { data, loading, pagination } = useFetch('/api/employees');
  return (
    <div>
      <PageHeader title="Employees" />
      <DataTable columns={columns} data={data} />
      <Pagination {...pagination} />
    </div>
  );
};

// ✅ Service: single responsibility
export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// ✅ Axios instance: centralized config + interceptors
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) { /* logout */ }
    return Promise.reject(err.response?.data || err);
  }
);
```

### 7.4 Folder & File Conventions

| Convention | Rule |
|-----------|------|
| File naming | `kebab-case.js` / `kebab-case.jsx` |
| Component files | PascalCase if default export, e.g., `Button.jsx` |
| Single export per file | Prefer default export for components, named exports for utils/services |
| Barrel files | `index.js` re-exports everything in a directory |
| Max file length | < 300 lines per file |
| Max function length | < 30 lines per function |
| Import ordering | 3rd party → absolute internal → relative, with blank lines between groups |

### 7.5 Error Message Standards

```
// Backend → Frontend
{
  "success": false,
  "error": "Employee with this email already exists",
  "statusCode": 409
}

// Validation errors
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "salary", "message": "Salary must be a positive number" }
  ]
}
```

### 7.6 Security Checklist

- [ ] Passwords hashed with bcryptjs (12 rounds)
- [ ] JWT signed with strong secret, short expiry (24h)
- [ ] Rate limiting on auth endpoints (express-rate-limit)
- [ ] CORS whitelist for production origin
- [ ] Input validation on all mutations (Zod or Joi)
- [ ] MongoDB injection prevention (mongo-sanitize)
- [ ] HTTP headers secured (helmet)
- [ ] No sensitive data in error responses (operational vs programming errors)
- [ ] File upload size limits and type whitelist
- [ ] `.env` never committed to git

---

## Appendix: Environment Variables

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud
VITE_CLOUDINARY_UPLOAD_PRESET=ems_preset
```

### Backend (.env)

```
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/ems?retryWrites=true&w=majority

JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=24h

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

CORS_ORIGIN=http://localhost:5173
```

---

## Appendix: Vercel Deployment Strategy

### Backend (serverless)

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Frontend (SPA)

```
Build command: npm run build
Output dir: dist
Framework preset: Vite
Rewrite all routes to index.html for SPA routing
```

Both deployed separately under Vercel. The frontend `VITE_API_URL` points to the backend's Vercel domain.

---

*End of Architecture Document*
