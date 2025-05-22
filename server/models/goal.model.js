const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Vacation",
        "Emergency Fund",
        "Education",
        "Home",
        "Vehicle",
        "Other",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ["In Progress", "Completed", "Cancelled"],
      default: "In Progress",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress percentage
goalSchema.virtual("progressPercentage").get(function () {
  return (this.currentAmount / this.targetAmount) * 100;
});

// Index for faster querying
goalSchema.index({ user: 1, status: 1 });

const Goal = mongoose.model("Goal", goalSchema);

module.exports = Goal;
