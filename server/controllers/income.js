import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validator.js";
import * as incomeService from "../services/income.js";
import { createIncomeSchema, updateIncomeSchema } from "../schemas/income.js";

export const createIncome = [
  validate(createIncomeSchema),
  asyncHandler(async (req, res) => {
    const income = await incomeService.createIncome(
      req.user._id,
      req.validatedData
    );
    res.status(201).json(income);
  }),
];

export const getIncomes = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    source: req.query.source,
    paymentMethod: req.query.paymentMethod,
  };

  const incomes = await incomeService.getIncomes(req.user._id, filters);
  res.status(200).json(incomes);
});

export const getIncomeById = asyncHandler(async (req, res) => {
  const income = await incomeService.getIncomeById(req.user._id, req.params.id);
  res.status(200).json(income);
});

export const updateIncome = [
  validate(updateIncomeSchema),
  asyncHandler(async (req, res) => {
    const income = await incomeService.updateIncome(
      req.user._id,
      req.params.id,
      req.validatedData
    );
    res.status(200).json(income);
  }),
];

export const deleteIncome = asyncHandler(async (req, res) => {
  const result = await incomeService.deleteIncome(req.user._id, req.params.id);
  res.status(204).json(result);
});
