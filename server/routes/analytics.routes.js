const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const Expense = require("../models/expense.model");
const Income = require("../models/income.model");
const Budget = require("../models/budget.model");

// Get monthly summary
router.get("/monthly-summary", auth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Month parameter is required" });
    }

    const monthDate = new Date(month);
    const startDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1
    );
    const endDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    );

    const [expenses, incomes, budgets] = await Promise.all([
      Expense.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      }),
      Income.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      }),
      Budget.find({
        user: req.user._id,
        month: startDate,
      }),
    ]);

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    // Category-wise spending
    const categorySpending = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    // Budget vs Actual
    const budgetComparison = budgets.map((budget) => ({
      category: budget.category,
      budgeted: budget.amount,
      spent: categorySpending[budget.category] || 0,
      remaining: budget.amount - (categorySpending[budget.category] || 0),
    }));

    res.json({
      totalExpenses,
      totalIncome,
      netSavings: totalIncome - totalExpenses,
      categorySpending,
      budgetComparison,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch monthly summary" });
  }
});

// Get 6-month trends
router.get("/trends", auth, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth() - 5,
      1
    );

    const [expenses, incomes] = await Promise.all([
      Expense.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      }),
      Income.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      }),
    ]);

    const monthlyTrends = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const monthExpenses = expenses.filter(
        (expense) =>
          expense.date.getMonth() === month.getMonth() &&
          expense.date.getFullYear() === month.getFullYear()
      );
      const monthIncomes = incomes.filter(
        (income) =>
          income.date.getMonth() === month.getMonth() &&
          income.date.getFullYear() === month.getFullYear()
      );

      const categorySpending = monthExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});

      monthlyTrends.push({
        month: month.toISOString().slice(0, 7),
        totalExpenses: monthExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        ),
        totalIncome: monthIncomes.reduce(
          (sum, income) => sum + income.amount,
          0
        ),
        categorySpending,
      });
    }

    res.json(monthlyTrends.reverse());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trends" });
  }
});

// Get category breakdown for a specific month
router.get("/category-breakdown", auth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Month parameter is required" });
    }

    const monthDate = new Date(month);
    const startDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1
    );
    const endDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    );

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const categoryBreakdown = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          total: 0,
          transactions: [],
          percentage: 0,
        };
      }
      acc[expense.category].total += expense.amount;
      acc[expense.category].transactions.push({
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        paymentMethod: expense.paymentMethod,
      });
      return acc;
    }, {});

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate percentages
    Object.keys(categoryBreakdown).forEach((category) => {
      categoryBreakdown[category].percentage =
        (categoryBreakdown[category].total / totalExpenses) * 100;
    });

    res.json({
      totalExpenses,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category breakdown" });
  }
});

module.exports = router;
