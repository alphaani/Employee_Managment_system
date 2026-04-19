# Employee Management System (EMS) 

##  Project Overview
**Employee Management System (EMS)** is a comprehensive HR management solution built with **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It automates all core HR functions including employee management, attendance tracking, payroll processing, leave management, and analytics.

### Key Objectives
- Centralized employee data management
- Automated attendance and payroll systems
- Real-time dashboard analytics
- Role-based access control (Admin & Employee)

## 👥 User Roles
| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, employee CRUD, leave approval, reports |
| **Employee** | Profile view, attendance check-in/out, leave requests, payslip |

## ⚙️ Core Features

### 1. 👤 Employee Management
- Add/Edit/Delete employees
- Profile management (department, position, salary)
- Employee directory with search/filter

### 2. 🕒 Smart Attendance System
- Check-in/Check-out with timestamps
- Late detection & status tracking (Present/Absent/Late)
- Monthly attendance reports

### 3. 💰 Advanced Payroll System
- Automated salary calculation
- Overtime & bonus support
- Deductions for absences
- Payslip generation (PDF)
- Payment status tracking

### 4. 📅 Leave Management
- Leave request submission
- Admin approval/rejection
- Leave balance tracking
- Calendar integration

### 5. 📊 Dashboard & Analytics
- Employee count & statistics
- Attendance trends
- Payroll summaries
- Department-wise analytics
- Interactive charts

### 6. 🔐 Authentication
- JWT-based secure login
- Role-based access control
- Protected routes

## 🏗️ Tech Stack
```
Frontend: React.js, React Router, Axios, Chart.js, Tailwind CSS
Backend: Node.js, Express.js, JWT, bcryptjs
Database: MongoDB (Mongoose ODM)
Other: Nodemailer, PDFKit, CORS, dotenv
```

## 📁 Project Structure
```
Employee-Management-System/
├── Frontend/
│   └── src/
│       ├── pages/          # Dashboard, Employees, Attendance, etc.
│       ├── components/     # Reusable UI components
│       ├── services/       # API calls
│       ├── utils/          # Helpers & constants
│       └── App.jsx
├── Backend/
│   ├── controllers/        # Business logic
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, validation
│   ├── config/             # DB, JWT config
│   └── server.js
├── README.md
└── package.json
```

