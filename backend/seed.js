const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin, Department, Employee } = require('./src/models');

const adminUser = {
  fullName: 'Super Admin',
  email: 'admin@ems.com',
  password: 'admin123',
  role: 'super-admin',
};

const departments = [
  { departmentName: 'Engineering', description: 'Software development and infrastructure', manager: 'Sarah Johnson' },
  { departmentName: 'Marketing', description: 'Brand and growth marketing', manager: 'Mike Chen' },
  { departmentName: 'Sales', description: 'Revenue and client acquisition', manager: 'Emily Davis' },
  { departmentName: 'Human Resources', description: 'People operations and culture', manager: 'James Wilson' },
  { departmentName: 'Finance', description: 'Financial planning and analysis', manager: 'Anna Park' },
  { departmentName: 'Operations', description: 'Business operations and logistics', manager: 'Robert Kim' },
];

const employees = [
  { fullName: 'Sarah Johnson', email: 'sarah@ems.com', password: 'employee123', position: 'Engineering Manager', status: 'active' },
  { fullName: 'Mike Chen', email: 'mike@ems.com', password: 'employee123', position: 'Marketing Lead', status: 'active' },
  { fullName: 'Emily Davis', email: 'emily@ems.com', password: 'employee123', position: 'Sales Director', status: 'active' },
  { fullName: 'James Wilson', email: 'james@ems.com', password: 'employee123', position: 'HR Manager', status: 'active' },
  { fullName: 'Anna Park', email: 'anna@ems.com', password: 'employee123', position: 'Finance Head', status: 'active' },
  { fullName: 'Robert Kim', email: 'robert@ems.com', password: 'employee123', position: 'Operations Lead', status: 'active' },
  { fullName: 'Lisa Thompson', email: 'lisa@ems.com', password: 'employee123', position: 'Senior Developer', status: 'active' },
  { fullName: 'David Garcia', email: 'david@ems.com', password: 'employee123', position: 'UX Designer', status: 'active' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await Admin.create(adminUser);
      console.log(`✓ Admin created: ${adminUser.email} / ${adminUser.password}`);
    } else {
      console.log(`- Admin already exists: ${adminUser.email}`);
    }

    const existingDepts = await Department.countDocuments();
    if (existingDepts === 0) {
      const created = await Department.insertMany(departments);
      console.log(`✓ ${created.length} departments created`);

      const engDept = created.find((d) => d.departmentName === 'Engineering');
      const mktDept = created.find((d) => d.departmentName === 'Marketing');
      const salesDept = created.find((d) => d.departmentName === 'Sales');
      const hrDept = created.find((d) => d.departmentName === 'Human Resources');
      const finDept = created.find((d) => d.departmentName === 'Finance');
      const opsDept = created.find((d) => d.departmentName === 'Operations');

      const deptMap = [engDept, mktDept, salesDept, hrDept, finDept, opsDept, engDept, mktDept];
      const empWithDepts = employees.map((emp, i) => ({
        ...emp,
        departmentId: deptMap[i]?._id,
      }));

      const hashedEmps = await Promise.all(
        empWithDepts.map(async (emp) => ({
          ...emp,
          password: await bcrypt.hash(emp.password, 12),
        }))
      );
      await Employee.insertMany(hashedEmps);
      console.log(`✓ ${employees.length} employees created (password: employee123)`);
    } else {
      console.log(`- ${existingDepts} departments already exist, skipping seed`);
    }

    console.log('\nSeed complete! Login credentials:');
    console.log('  Admin:    admin@ems.com / admin123');
    console.log('  Employee: sarah@ems.com / employee123');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
