const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Department name must be at least 2 characters'],
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    manager: {
      type: String,
      trim: true,
      maxlength: [100, 'Manager name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'departmentId',
  options: { match: { status: 'active' } },
});

departmentSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'departmentId',
  count: true,
  options: { match: { status: 'active' } },
});

module.exports = mongoose.model('Department', departmentSchema);
