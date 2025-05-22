const express = require("express");
const router = express.Router();
const { z } = require("zod");
const auth = require("../middleware/auth.middleware");
const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model");
const { sendEmail, emailTemplates } = require("../utils/email");

// Validation schema
const expenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  category: z.enum([
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Shopping",
    "Other",
  ]),
  date: z.string().transform((str) => new Date(str)),
  paymentMethod: z.enum(["Bank", "Cash", "Credit Card"]),
});

// Create expense
router.post("/", auth, async (req, res) => {
  try {
    const expenseData = expenseSchema.parse(req.body);
    const expense = new Expense({
      ...expenseData,
      user: req.user._id,
    });

    await expense.save();

    // Update budget and check thresholds
    const budget = await Budget.findOne({
      user: req.user._id,
      category: expense.category,
      month: new Date(expense.date.getFullYear(), expense.date.getMonth()),
    });

    if (budget) {
      budget.currentSpending += expense.amount;

      // Check budget thresholds and send notifications
      const spendingPercentage = (budget.currentSpending / budget.amount) * 100;

      if (spendingPercentage >= 100 && !budget.notifications.hundredPercent) {
        budget.notifications.hundredPercent = true;
        await sendEmail({
          to: req.user.email,
          ...emailTemplates.budgetAlert(budget, 100),
        });
      } else if (
        spendingPercentage >= 80 &&
        !budget.notifications.eightyPercent
      ) {
        budget.notifications.eightyPercent = true;
        await sendEmail({
          to: req.user.email,
          ...emailTemplates.budgetAlert(budget, 80),
        });
      }

      await budget.save();
    }

    // Send expense notification
    await sendEmail({
      to: req.user.email,
      ...emailTemplates.expenseCreated(expense),
    });

    res.status(201).json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to create expense" });
  }
});

// Get all expenses with filters
router.get("/", auth, async (req, res) => {
  try {
    const { month, category, paymentMethod, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    // Apply filters
    if (month) {
      const date = new Date(month);
      query.date = {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      };
    }
    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// Get single expense
router.get("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expense" });
  }
});

// Update expense
router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = expenseSchema.partial().parse(req.body);
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // If amount or category changed, update budget
    if (updates.amount || updates.category) {
      const oldBudget = await Budget.findOne({
        user: req.user._id,
        category: expense.category,
        month: new Date(expense.date.getFullYear(), expense.date.getMonth()),
      });

      if (oldBudget) {
        oldBudget.currentSpending -= expense.amount;
        await oldBudget.save();
      }

      if (updates.amount || updates.category) {
        const newBudget = await Budget.findOne({
          user: req.user._id,
          category: updates.category || expense.category,
          month: new Date(expense.date.getFullYear(), expense.date.getMonth()),
        });

        if (newBudget) {
          newBudget.currentSpending += updates.amount || expense.amount;
          await newBudget.save();
        }
      }
    }

    Object.assign(expense, updates);
    await expense.save();

    res.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to update expense" });
  }
});

// Delete expense
router.delete("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Update budget
    const budget = await Budget.findOne({
      user: req.user._id,
      category: expense.category,
      month: new Date(expense.date.getFullYear(), expense.date.getMonth()),
    });

    if (budget) {
      budget.currentSpending -= expense.amount;
      await budget.save();
    }

    await expense.remove();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

module.exports = router;
