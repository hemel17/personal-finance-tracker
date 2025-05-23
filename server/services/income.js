import Income from "../models/Income.js";
import createError from "../utils/error.js";
import { sendEmail, emailTemplates } from "../utils/email.js";

export const createIncome = async (userId, incomeData) => {
  const income = new Income({
    user: userId,
    ...incomeData,
  });

  await income.save();

  // Send email notification for new income
  const user = await income.populate("user");

  await sendEmail({
    to: user.user.email,
    ...emailTemplates.incomeRecorded(income),
  });

  return income;
};

export const getIncomes = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  if (filters.source) {
    query.source = filters.source;
  }

  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }

  const incomes = await Income.find(query).sort({ date: -1 });
  return incomes;
};

export const getIncomeById = async (userId, incomeId) => {
  const income = await Income.findOne({ _id: incomeId, user: userId });
  if (!income) {
    throw createError("Income not found", 404);
  }
  return income;
};

export const updateIncome = async (userId, incomeId, updates) => {
  const income = await Income.findOne({ _id: incomeId, user: userId });
  if (!income) {
    throw createError("Income not found", 404);
  }

  Object.assign(income, updates);
  await income.save();

  return income;
};

export const deleteIncome = async (userId, incomeId) => {
  console.log(" income id : ", incomeId);
  const income = await Income.findOneAndDelete({ _id: incomeId, user: userId });
  if (!income) {
    throw createError("Income not found", 404);
  }

  return { message: "Income deleted successfully" };
};
