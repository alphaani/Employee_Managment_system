# Employee Management System (EMS) 🚀

## 🎯 Project Overview
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

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm/yarn

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Update .env with MongoDB URI, JWT_SECRET
npm run dev
```
**Backend runs on**: `http://localhost:5000`

### Frontend Setup
```bash
cd Frontend
npm install
npm start
```
**Frontend runs on**: `http://localhost:3000`

### Environment Variables
Create `.env` files:

**Backend (.env)**:
```
MONGO_URI=mongodb://localhost:27017/ems
JWT_SECRET=your-super-secret-key
PORT=5000
NODE_ENV=development
```

## 📖 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | User login | No |
| GET | `/api/employees` | Get all employees | Admin |
| POST | `/api/employees` | Create employee | Admin |
| POST | `/api/attendance/checkin` | Check-in | Employee |
| GET | `/api/payroll` | Get payroll | Admin/Employee |
| POST | `/api/leaves` | Request leave | Employee |

## 🧪 Testing
```bash
# Backend tests
cd Backend && npm test

# Frontend tests
cd Frontend && npm test
```

## 📊 Database Schemas
- **User**: name, email, role, password
- **Employee**: personal info, department, salary, position
- **Attendance**: employeeId, checkIn, checkOut, status
- **Payroll**: employeeId, month, amount, status
- **Leave**: employeeId, type, dates, status

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License
This project is licensed under MIT License.

## 👨‍💼 Team
- **Mahad Nur Sharif** (C1220617)
- **Abdirahman Afrah Hassan** (C1220199)

---

**Built with ❤️ for modern HR management!**
