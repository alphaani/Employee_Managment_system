Name: Mahad Nur Sharif 
Project Title: Employee Management System 
Defense Date: 28/06/2026 
1. PROBLEM 
Many organizations and businesses face challenges in managing employee information, 
attendance records, salaries, and departmental operations efficiently. Traditional paper-based 
systems often result in data loss, duplication, human errors, and delays in accessing employee 
records. 
The Employee Management System solves these challenges by providing a centralized platform 
where administrators can manage employee records, departments, attendance, payroll, and 
performance tracking. The system improves organizational efficiency, reduces paperwork, and 
ensures secure storage of employee data. 
2. ENTITIES 
Employee 
• employeeId 
• fullName 
• email 
• password 
• phoneNumber 
• gender 
• position 
• departmentId 
• salary 
• profileImage 
• joiningDate 
• status 
Department 
• departmentId 
• departmentName 
• description 
• manager 
Attendance 
• attendanceId 
• employeeId 
• checkInTime 
• checkOutTime 
• date 
• status 
Payroll 
• payrollId 
• employeeId 
• basicSalary 
• bonus 
• deduction 
• totalSalary 
• paymentDate 
• status 
Leave 
• leaveId 
• employeeId 
• leaveType 
• startDate 
• endDate 
• reason 
• status 
Performance 
• performanceId 
• employeeId 
• rating 
• feedback 
• evaluationDate 
Admin 
• adminId 
• fullName 
• email 
• password 
• role 
3. WORKFLOW 
o Admin creates departments. 
o Admin registers employees. 
o Employees log into the system. 
o Employees update their profiles. 
o Employees check in and check out daily. 
o Attendance records are automatically stored. 
o Employees submit leave requests. 
o Admin reviews and approves leave requests. 
o Payroll is generated automatically. 
o Admin monitors employee performance. 
o Reports and analytics are generated. 
Workflow Diagram: 
Admin Setup → Employee Registration → Employee Login → Attendance Tracking → Leave 
Management → Payroll Processing → Performance Evaluation → Reports & Analytics 
4. TECH STACK 
Backend 
• Node.js 
• Express.js 
• MongoDB Atlas 
• Mongoose 
• JWT Authentication 
• bcryptjs 
• Multer 
Frontend 
• React.js 
• Vite 
• Tailwind CSS 
• React Router DOM 
• Axios 
• Framer Motion 
• React Icons 
• Recharts 
Deployment 
• Frontend: Vercel 
• Backend: Vercel 
• Database: MongoDB Atlas 
5. KEY FEATURES 
Authentication & Authorization 
• Employee Registration 
• Employee Login 
• Secure JWT Authentication 
• Role-Based Access Control 
Employee Features 
• Manage Personal Profile 
• Attendance Check In 
• Attendance Check Out 
• Leave Request Submission 
• View Salary Information 
• Performance Feedback View 
• Notifications and Alerts 
Attendance Management 
• Daily Attendance Tracking 
• Late Arrival Monitoring 
• Absence Tracking 
• Attendance Reports 
Payroll Management 
• Salary Calculation 
• Bonus Management 
• Deduction Management 
• Payroll History 
• Salary Reports 
Department Management 
• Create Departments 
• Assign Employees 
• Department Statistics 
• Department Performance Monitoring 
Performance Management 
• Employee Evaluation 
• Performance Ratings 
• Manager Feedback 
• Promotion Recommendations 
Admin Features 
• Employee Management 
• Department Management 
• Attendance Monitoring 
• Leave Approval 
• Payroll Management 
• Performance Tracking 
• Analytics Dashboard 
• Report Generation 
Responsive Design 
• Mobile Friendly 
• Tablet Friendly 
• Desktop Friendly 
6. CHALLENGES & LEARNINGS 
Challenges 
• Designing scalable database relationships. 
• Implementing secure authentication and authorization. 
• Managing attendance records efficiently. 
• Automating payroll calculations. 
• Building role-based dashboards. 
• Deploying full-stack applications on Vercel. 
• Handling image uploads using Cloudinary. 
7 SYSTEM BENEFITS 
• Reduces paperwork. 
• Improves employee record management. 
• Enhances attendance monitoring. 
• Simplifies payroll processing. 
• Provides accurate organizational reports. 
• Increases operational efficiency. 
• Improves decision-making through analytics. 
9. GITHUB LINK 
GitHub Repository: 
https://github.com/alphaani/Employee_Managment_system.git 