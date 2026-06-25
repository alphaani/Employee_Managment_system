const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    evaluationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

performanceSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'employeeId',
    select: 'fullName email position departmentId',
  });
  next();
});

performanceSchema.index({ employeeId: 1, evaluationDate: 1 });
performanceSchema.index({ rating: 1 });
performanceSchema.index({ evaluationDate: 1 });

module.exports = mongoose.model('Performance', performanceSchema);
