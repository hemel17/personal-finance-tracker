const express = require("express");
const router = express.Router();
const { z } = require("zod");
const auth = require("../middleware/auth.middleware");
const Budget = require("../models/budget.model");
const Expense = require("../models/expense.model");
const { sendEmail, emailTemplates } = require("../utils/email");

// Validation schema
const budgetSchema = z.object({
  category: z.enum([
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Shopping",
    "Other",
  ]),
  amount: z.number().positive(),
  month: z.string().transform((str) => new Date(str)),
});

// Create or update budget
router.post("/", auth, async (req, res) => {
  try {
    const budgetData = budgetSchema.parse(req.body);

    // Normalize month to first day
    budgetData.month = new Date(
      budgetData.month.getFullYear(),
      budgetData.month.getMonth(),
      1
    );

    // Find existing budget or create new one
    let budget = await Budget.findOne({
      user: req.user._id,
      category: budgetData.category,
      month: budgetData.month,
    });

    if (budget) {
      budget.amount = budgetData.amount;
      // Reset notifications if budget is increased
      if (budget.amount > budget.currentSpending) {
        const percentage = (budget.currentSpending / budget.amount) * 100;
        budget.notifications = {
          eightyPercent: percentage >= 80,
          hundredPercent: percentage >= 100,
        };
      }
    } else {
      budget = new Budget({
        ...budgetData,
        user: req.user._id,
        currentSpending: 0,
        notifications: {
          eightyPercent: false,
          hundredPercent: false,
        },
      });

      // Calculate current spending for new budget
      const monthStart = new Date(budgetData.month);
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );

      const expenses = await Expense.find({
        user: req.user._id,
        category: budgetData.category,
        date: { $gte: monthStart, $lte: monthEnd },
      });

      budget.currentSpending = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
    }

    await budget.save();
    res.json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to set budget" });
  }
});

// Get all budgets for a month
router.get("/", auth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Month parameter is required" });
    }

    const monthDate = new Date(month);
    const budgets = await Budget.find({
      user: req.user._id,
      month: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
    });

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
});

// Get budget by category and month
router.get("/:category", auth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Month parameter is required" });
    }

    const monthDate = new Date(month);
    const budget = await Budget.findOne({
      user: req.user._id,
      category: req.params.category,
      month: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch budget" });
  }
});

// Delete budget
router.delete("/:category", auth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Month parameter is required" });
    }

    const monthDate = new Date(month);
    const budget = await Budget.findOneAndDelete({
      user: req.user._id,
      category: req.params.category,
      month: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete budget" });
  }
});

module.exports = router;
