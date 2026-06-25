const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please provide a valid phone number'],
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a valid gender',
      },
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid department ID',
      },
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    cloudinaryId: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

employeeSchema.virtual('attendances', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'employeeId',
});

employeeSchema.virtual('leaves', {
  ref: 'Leave',
  localField: '_id',
  foreignField: 'employeeId',
});

employeeSchema.virtual('payrolls', {
  ref: 'Payroll',
  localField: '_id',
  foreignField: 'employeeId',
});

employeeSchema.virtual('performances', {
  ref: 'Performance',
  localField: '_id',
  foreignField: 'employeeId',
});

employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.pre(/^find/, function (next) {
  this.populate({ path: 'departmentId', select: 'departmentName' });
  next();
});

employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

employeeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

employeeSchema.index({ departmentId: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ departmentId: 1, status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
