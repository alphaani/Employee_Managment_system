const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
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
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!this.checkInTime || !v) return true;
          return v > this.checkInTime;
        },
        message: 'Check-out time must be after check-in time',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['present', 'absent', 'late', 'half-day'],
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'present',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

attendanceSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'employeeId',
    select: 'fullName email departmentId profileImage',
  });
  next();
});

attendanceSchema.index({ employeeId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ employeeId: 1, status: 1 });
attendanceSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
