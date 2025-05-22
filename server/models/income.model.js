const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      required: true,
      enum: ["Salary", "Freelance", "Investments", "Other"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Bank", "Cash", "Credit Card"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster querying
incomeSchema.index({ user: 1, date: -1 });
incomeSchema.index({ source: 1 });
incomeSchema.index({ paymentMethod: 1 });

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
