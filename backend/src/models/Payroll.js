const mongoose = require('mongoose');

const deductionItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid employee ID',
      },
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Basic salary cannot be negative'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative'],
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Overtime hours cannot be negative'],
    },
    overtimeRate: {
      type: Number,
      default: 0,
      min: [0, 'Overtime rate cannot be negative'],
    },
    deduction: {
      type: Number,
      default: 0,
      min: [0, 'Deduction cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    otherDeductions: {
      type: [deductionItemSchema],
      default: [],
    },
    grossPay: {
      type: Number,
      min: [0, 'Gross pay cannot be negative'],
    },
    totalDeductions: {
      type: Number,
      min: [0, 'Total deductions cannot be negative'],
    },
    netPay: {
      type: Number,
      min: [0, 'Net pay cannot be negative'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['bank', 'cash', 'cheque'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'bank',
    },
    bankName: { type: String, trim: true },
    bankAccount: { type: String, trim: true },
    status: {
      type: String,
      enum: {
        values: ['paid', 'unpaid', 'pending'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

payrollSchema.pre('save', function (next) {
  const overtimePay = (this.overtimeHours || 0) * (this.overtimeRate || 0);
  const otherTotal = (this.otherDeductions || []).reduce((s, d) => s + d.amount, 0);
  this.grossPay = (this.basicSalary || 0) + (this.bonus || 0) + overtimePay;
  this.totalDeductions = (this.deduction || 0) + (this.tax || 0) + otherTotal;
  this.netPay = this.grossPay - this.totalDeductions;
  next();
});

payrollSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'employeeId',
    select: 'fullName email departmentId position',
  });
  next();
});

payrollSchema.index({ employeeId: 1, paymentDate: 1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ paymentDate: 1 });
payrollSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
