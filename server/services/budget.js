import createError from "../utils/error.js";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";

export const createBudget = async (userId, budgetData) => {
  // Normalize month to first day
  const monthStart = new Date(
    budgetData.month.getFullYear(),
    budgetData.month.getMonth(),
    1
  );

  // Check for existing budget
  let budget = await Budget.findOne({
    user: userId,
    category: budgetData.category,
    month: monthStart,
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
      user: userId,
      month: monthStart,
      currentSpending: 0,
      notifications: {
        eightyPercent: false,
        hundredPercent: false,
      },
    });

    // Calculate current spending for new budget
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );

    const expenses = await Expense.find({
      user: userId,
      category: budgetData.category,
      date: { $gte: monthStart, $lte: monthEnd },
    });

    budget.currentSpending = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  }

  await budget.save();
  return budget;
};

export const getBudgets = async (userId, month) => {
  if (!month) {
    throw createError(400, "Month parameter is required");
  }

  const monthDate = new Date(month);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

  return await Budget.find({
    user: userId,
    month: monthStart,
  });
};

export const getBudgetByCategory = async (userId, category, month) => {
  if (!month) {
    throw createError(400, "Month parameter is required");
  }

  const monthDate = new Date(month);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

  const budget = await Budget.findOne({
    user: userId,
    category,
    month: monthStart,
  });

  if (!budget) {
    throw createError(404, "Budget not found");
  }

  return budget;
};

export const updateBudget = async (userId, category, budgetData) => {
  if (!budgetData.month) {
    throw createError(400, "Month parameter is required");
  }

  const monthStart = new Date(
    budgetData.month.getFullYear(),
    budgetData.month.getMonth(),
    1
  );

  const budget = await Budget.findOne({
    user: userId,
    category,
    month: monthStart,
  });

  if (!budget) {
    throw createError(404, "Budget not found");
  }

  // Update budget amount if provided
  if (budgetData.amount !== undefined) {
    budget.amount = budgetData.amount;
    // Reset notifications if budget is increased
    if (budget.amount > budget.currentSpending) {
      const percentage = (budget.currentSpending / budget.amount) * 100;
      budget.notifications = {
        eightyPercent: percentage >= 80,
        hundredPercent: percentage >= 100,
      };
    }
  }

  await budget.save();
  return budget;
};

export const deleteBudget = async (userId, category, month) => {
  if (!month) {
    throw createError(400, "Month parameter is required");
  }

  const monthDate = new Date(month);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

  const budget = await Budget.findOneAndDelete({
    user: userId,
    category,
    month: monthStart,
  });

  if (!budget) {
    throw createError(404, "Budget not found");
  }

  return { message: "Budget deleted successfully" };
};
