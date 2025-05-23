import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validator.js";
import * as goalService from "../services/goal.js";
import { createGoalSchema, updateGoalSchema } from "../schemas/goal.js";

export const createGoal = [
  validate(createGoalSchema),
  asyncHandler(async (req, res) => {
    const goal = await goalService.createGoal(req.user._id, req.validatedData);
    res.status(201).json(goal);
  }),
];

export const getGoals = asyncHandler(async (req, res) => {
  const goals = await goalService.getGoals(req.user._id, req.query.status);
  res.status(200).json(goals);
});

export const getGoalById = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoalById(req.user._id, req.params.goalId);
  res.status(200).json(goal);
});

export const updateGoal = [
  validate(updateGoalSchema),
  asyncHandler(async (req, res) => {
    const goal = await goalService.updateGoal(
      req.user._id,
      req.params.goalId,
      req.validatedData
    );
    res.status(200).json(goal);
  }),
];

export const deleteGoal = asyncHandler(async (req, res) => {
  const result = await goalService.deleteGoal(req.user._id, req.params.goalId);
  res.status(200).json(result);
});
