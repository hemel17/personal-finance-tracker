const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Transport",
        "Entertainment",
        "Bills",
        "Healthcare",
        "Shopping",
        "Other",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Date,
      required: true,
    },
    currentSpending: {
      type: Number,
      default: 0,
    },
    notifications: {
      eightyPercent: {
        type: Boolean,
        default: false,
      },
      hundredPercent: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique budget per user, category and month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
