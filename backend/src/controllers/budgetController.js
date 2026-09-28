const BudgetModel = require('../models/budgetModel');
const ExpenseModel = require('../models/expenseModel');

const BudgetController = {
  /**
   * Get budgets for a given month/year with actual spending and progress
   * GET /api/budgets?month=9&year=2026
   */
  async getBudgets(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

      // Get user budgets
      const budgets = await BudgetModel.findUserBudgets(userId, month, year);

      // Get expenses for that month to calculate real spending
      const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
      // Last day of month
      const lastDay = new Date(year, month, 0).getDate();
      const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const expenses = await ExpenseModel.getForPeriod(userId, startOfMonth, endOfMonth);

      // Group expenses by category
      const spendingByCategory = {};
      expenses.forEach(exp => {
        const cat = exp.category;
        spendingByCategory[cat] = (spendingByCategory[cat] || 0) + Number(exp.amount);
      });

      // Enrich budgets with actual spending, remaining, percentage and status
      const enrichedBudgets = budgets.map(b => {
        const budgetAmount = Number(b.amount);
        const spent = spendingByCategory[b.category] || 0;
        const remaining = Math.max(0, budgetAmount - spent);
        const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

        let status = 'Safe';
        let alertLevel = 'normal'; // normal, warning, near_limit, exceeded

        if (percentage >= 100) {
          status = 'Exceeded';
          alertLevel = 'exceeded';
        } else if (percentage >= 90) {
          status = 'Near limit';
          alertLevel = 'near_limit';
        } else if (percentage >= 80) {
          status = 'Warning';
          alertLevel = 'warning';
        }

        return {
          ...b,
          spent: Number(spent.toFixed(2)),
          remaining: Number(remaining.toFixed(2)),
          percentage,
          status,
          alertLevel,
          isExceeded: percentage >= 100
        };
      });

      const totalBudget = enrichedBudgets.reduce((acc, b) => acc + Number(b.amount), 0);
      const totalSpentInBudgets = enrichedBudgets.reduce((acc, b) => acc + b.spent, 0);

      return res.status(200).json({
        success: true,
        data: {
          month,
          year,
          totalBudget: Number(totalBudget.toFixed(2)),
          totalSpentInBudgets: Number(totalSpentInBudgets.toFixed(2)),
          totalRemaining: Number(Math.max(0, totalBudget - totalSpentInBudgets).toFixed(2)),
          budgets: enrichedBudgets
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create or update a budget for a category
   * POST /api/budgets
   */
  async createOrUpdateBudget(req, res, next) {
    try {
      const userId = req.user.id;
      const { category, amount, month, year } = req.body;

      const budget = await BudgetModel.upsertBudget({
        userId,
        category,
        amount,
        month,
        year
      });

      return res.status(201).json({
        success: true,
        message: 'Budget saved successfully!',
        data: budget
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update budget by ID
   * PUT /api/budgets/:id
   */
  async updateBudget(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { amount, category } = req.body;

      const existing = await BudgetModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or you do not have permission to edit it.'
        });
      }

      const updated = await BudgetModel.update(id, userId, {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category && { category: category.trim() })
      });

      return res.status(200).json({
        success: true,
        message: 'Budget updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete budget by ID
   * DELETE /api/budgets/:id
   */
  async deleteBudget(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existing = await BudgetModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or you do not have permission to delete it.'
        });
      }

      await BudgetModel.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Budget deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = BudgetController;
