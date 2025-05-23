import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Index for faster querying
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ paymentMethod: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
