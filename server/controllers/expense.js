import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validator.js";
import * as expenseService from "../services/expense.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../schemas/expense.js";

export const createExpense = [
  validate(createExpenseSchema),
  asyncHandler(async (req, res) => {
    const expense = await expenseService.createExpense(
      req.user._id,
      req.validatedData
    );
    res.status(201).json(expense);
  }),
];

export const getExpenses = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    category: req.query.category,
    paymentMethod: req.query.paymentMethod,
  };

  const expenses = await expenseService.getExpenses(req.user._id, filters);
  res.status(200).json(expenses);
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(
    req.user._id,
    req.params.id
  );
  res.status(200).json(expense);
});

export const updateExpense = [
  validate(updateExpenseSchema),
  asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(
      req.user._id,
      req.params.id,
      req.validatedData
    );
    res.status(200).json(expense);
  }),
];

export const deleteExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.deleteExpense(
    req.user._id,
    req.params.id
  );
  res.status(204);
});
