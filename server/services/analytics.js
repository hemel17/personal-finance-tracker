import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";

export const getSpendingTrends = async (
  userId,
  { startDate, endDate, category, groupBy = "month" }
) => {
  const match = {
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  };

  if (category) {
    match.category = category;
  }

  let groupStage = {};

  switch (groupBy) {
    case "day":
      groupStage = {
        $dateToString: { format: "%Y-%m-%d", date: "$date" },
      };
      break;
    case "week":
      groupStage = {
        $week: "$date",
      };
      break;
    case "month":
      groupStage = {
        $dateToString: { format: "%Y-%m", date: "$date" },
      };
      break;
    case "category":
      groupStage = "$category";
      break;
    case "paymentMethod":
      groupStage = "$paymentMethod";
      break;
  }

  const trends = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupStage,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return trends;
};

export const getBudgetPerformance = async (userId, month) => {
  const budgets = await Budget.find({
    user: userId,
    month,
  });

  const performance = await Promise.all(
    budgets.map(async (budget) => {
      const expenses = await Expense.aggregate([
        {
          $match: {
            user: userId,
            category: budget.category,
            date: {
              $gte: budget.month,
              $lt: new Date(
                budget.month.getFullYear(),
                budget.month.getMonth() + 1,
                1
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$amount" },
          },
        },
      ]);

      const totalSpent = expenses[0]?.totalSpent || 0;
      const remainingBudget = budget.amount - totalSpent;
      const utilizationRate = (totalSpent / budget.amount) * 100;

      return {
        category: budget.category,
        budgetAmount: budget.amount,
        totalSpent,
        remainingBudget,
        utilizationRate,
      };
    })
  );

  return performance;
};

export const getGoalProgress = async (userId) => {
  const goals = await Goal.find({ user: userId });

  const progress = await Promise.all(
    goals.map(async (goal) => {
      const totalSaved = await Expense.aggregate([
        {
          $match: {
            user: userId,
            category: "Savings",
            date: { $gte: goal.startDate, $lte: goal.targetDate },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const savedAmount = totalSaved[0]?.totalAmount || 0;
      const progressPercentage = (savedAmount / goal.targetAmount) * 100;
      const remainingAmount = goal.targetAmount - savedAmount;

      return {
        goalName: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount,
        remainingAmount,
        progressPercentage,
        targetDate: goal.targetDate,
      };
    })
  );

  return progress;
};

export const getCategoryDistribution = async (
  userId,
  { startDate, endDate }
) => {
  const distribution = await Expense.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        category: "$_id",
        totalAmount: 1,
        count: 1,
        percentage: {
          $multiply: [
            { $divide: ["$totalAmount", { $sum: "$totalAmount" }] },
            100,
          ],
        },
      },
    },
  ]);

  return distribution;
};
