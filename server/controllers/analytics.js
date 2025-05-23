import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validator.js";
import * as analyticsService from "../services/analytics.js";
import { analyticsQuerySchema } from "../schemas/analytics.js";

export const getSpendingTrends = [
  validate(analyticsQuerySchema),
  asyncHandler(async (req, res) => {
    const trends = await analyticsService.getSpendingTrends(
      req.user._id,
      req.validatedData
    );
    res.status(200).json(trends);
  }),
];

export const getBudgetPerformance = asyncHandler(async (req, res) => {
  const month = req.query.month ? new Date(req.query.month) : new Date();
  const performance = await analyticsService.getBudgetPerformance(
    req.user._id,
    month
  );
  res.status(200).json(performance);
});

export const getGoalProgress = asyncHandler(async (req, res) => {
  const progress = await analyticsService.getGoalProgress(req.user._id);
  res.status(200).json(progress);
});

export const getCategoryDistribution = [
  validate(analyticsQuerySchema),
  asyncHandler(async (req, res) => {
    const distribution = await analyticsService.getCategoryDistribution(
      req.user._id,
      req.validatedData
    );
    res.status(200).json(distribution);
  }),
];
