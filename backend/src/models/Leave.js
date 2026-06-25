const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
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
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'],
        message: '{VALUE} is not a valid leave type',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (v) {
          return v >= this.startDate;
        },
        message: 'End date must be on or after start date',
      },
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    adminMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: '{VALUE} is not a valid leave status',
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

leaveSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'employeeId',
    select: 'fullName email departmentId',
  });
  next();
});

leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
