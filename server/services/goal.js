import Goal from "../models/Goal.js";
import createError from "../utils/createError.js";

export const createGoal = async (userId, goalData) => {
  const goal = await Goal.create({
    user: userId,
    ...goalData,
  });
  return goal;
};

export const getGoals = async (userId, status) => {
  const query = { user: userId };
  if (status) query.status = status;
  const goals = await Goal.find(query).sort({ createdAt: -1 });
  return goals;
};

export const getGoalById = async (userId, goalId) => {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) {
    throw createError(404, "Goal not found");
  }
  return goal;
};

export const updateGoal = async (userId, goalId, updateData) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: goalId, user: userId },
    updateData,
    { new: true, runValidators: true }
  );
  if (!goal) {
    throw createError(404, "Goal not found");
  }
  return goal;
};

export const deleteGoal = async (userId, goalId) => {
  const goal = await Goal.findOneAndDelete({ _id: goalId, user: userId });
  if (!goal) {
    throw createError(404, "Goal not found");
  }
  return { message: "Goal deleted successfully" };
};
