import createError from "../utils/error.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import { sendEmail, emailTemplates } from "../utils/email.js";

export const createExpense = async (userId, expenseData) => {
  const expense = new Expense({
    ...expenseData,
    user: userId,
  });

  await expense.save();

  const user = await expense.populate("user");

  await sendEmail({
    to: user.user.email,
    ...emailTemplates.expenseCreated(expense),
  });

  // Update budget and check for threshold notifications
  const monthStart = new Date(
    expense.date.getFullYear(),
    expense.date.getMonth(),
    1
  );
  const budget = await Budget.findOne({
    user: userId,
    category: expense.category,
    month: monthStart,
  });

  if (budget) {
    budget.currentSpending += expense.amount;
    const spendingPercentage = (budget.currentSpending / budget.amount) * 100;

    // Check for 80% threshold
    if (spendingPercentage >= 80 && !budget.notifications.eightyPercent) {
      budget.notifications.eightyPercent = true;
      await sendEmail({
        to: budget.user.email,
        ...emailTemplates.budgetAlert(budget, spendingPercentage),
      });

      // Check for 100% threshold
      if (spendingPercentage >= 100 && !budget.notifications.hundredPercent) {
        budget.notifications.hundredPercent = true;
        await sendEmail({
          to: budget.user.email,
          ...emailTemplates.budgetAlert(budget, spendingPercentage),
        });
      }

      await budget.save();
    }

    return expense;
  }
  return expense;
};

export const getExpenses = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }

  return await Expense.find(query).sort({ date: -1 });
};

export const getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) {
    throw createError(404, "Expense not found");
  }
  return expense;
};

export const updateExpense = async (userId, expenseId, updateData) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) {
    throw createError(404, "Expense not found");
  }

  // If amount or category changed, update budget
  if (updateData.amount || updateData.category) {
    const oldAmount = expense.amount;
    const oldCategory = expense.category;
    const monthStart = new Date(
      expense.date.getFullYear(),
      expense.date.getMonth(),
      1
    );

    // Update old category budget if exists
    const oldBudget = await Budget.findOne({
      user: userId,
      category: oldCategory,
      month: monthStart,
    });

    if (oldBudget) {
      oldBudget.currentSpending -= oldAmount;
      await oldBudget.save();
    }

    // Update new category budget if exists and category changed
    if (updateData.category && updateData.category !== oldCategory) {
      const newBudget = await Budget.findOne({
        user: userId,
        category: updateData.category,
        month: monthStart,
      });

      if (newBudget) {
        newBudget.currentSpending += updateData.amount || oldAmount;
        await newBudget.save();
      }
    } else if (updateData.amount) {
      // Update same category budget with new amount
      if (oldBudget) {
        oldBudget.currentSpending += updateData.amount;
        await oldBudget.save();
      }
    }
  }

  Object.assign(expense, updateData);
  await expense.save();
  return expense;
};

export const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) {
    throw createError(404, "Expense not found");
  }

  // Update budget
  const monthStart = new Date(
    expense.date.getFullYear(),
    expense.date.getMonth(),
    1
  );
  const budget = await Budget.findOne({
    user: userId,
    category: expense.category,
    month: monthStart,
  });

  if (budget) {
    budget.currentSpending -= expense.amount;
    await budget.save();
  }

  await Expense.findByIdAndDelete(expenseId);
  return { message: "Expense deleted successfully" };
};
