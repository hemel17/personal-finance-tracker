import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validator.js";
import * as budgetService from "../services/budget.js";
import { createBudgetSchema, updateBudgetSchema } from "../schemas/budget.js";

export const createBudget = [
  validate(createBudgetSchema),
  asyncHandler(async (req, res) => {
    const budget = await budgetService.createBudget(
      req.user._id,
      req.validatedData
    );
    res.status(201).json(budget);
  }),
];

export const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getBudgets(req.user._id, req.query.month);
  res.status(200).json(budgets);
});

export const getBudgetByCategory = asyncHandler(async (req, res) => {
  const budget = await budgetService.getBudgetByCategory(
    req.user._id,
    req.params.category,
    req.query.month
  );
  res.status(200).json(budget);
});

export const updateBudget = [
  validate(updateBudgetSchema),
  asyncHandler(async (req, res) => {
    const budget = await budgetService.updateBudget(
      req.user._id,
      req.params.category,
      req.validatedData
    );
    res.status(200).json(budget);
  }),
];

export const deleteBudget = asyncHandler(async (req, res) => {
  const result = await budgetService.deleteBudget(
    req.user._id,
    req.params.category,
    req.query.month
  );
  res.status(200).json(result);
});
