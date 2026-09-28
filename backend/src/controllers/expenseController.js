const ExpenseModel = require('../models/expenseModel');

const ExpenseController = {
  /**
   * Get filtered expenses for the authenticated user
   * GET /api/expenses
   */
  async getExpenses(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        category,
        from,
        to,
        search,
        sort = 'newest',
        page = 1,
        limit = 50
      } = req.query;

      const parsedLimit = parseInt(limit, 10) || 50;
      const parsedPage = parseInt(page, 10) || 1;
      const offset = (parsedPage - 1) * parsedLimit;

      const { expenses, totalCount } = await ExpenseModel.findUserExpenses(userId, {
        category,
        fromDate: from,
        toDate: to,
        search,
        sort,
        limit: parsedLimit,
        offset
      });

      return res.status(200).json({
        success: true,
        data: {
          expenses,
          pagination: {
            total: totalCount,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(totalCount / parsedLimit) || 1
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single expense by ID
   * GET /api/expenses/:id
   */
  async getExpenseById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const expense = await ExpenseModel.findById(id, userId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or you do not have permission to view it.'
        });
      }

      return res.status(200).json({
        success: true,
        data: expense
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create a new expense
   * POST /api/expenses
   */
  async createExpense(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, amount, category, description, expense_date, payment_method } = req.body;

      const newExpense = await ExpenseModel.create({
        userId,
        title,
        amount,
        category,
        description,
        expense_date,
        payment_method
      });

      return res.status(201).json({
        success: true,
        message: 'Expense added successfully!',
        data: newExpense
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an expense
   * PUT /api/expenses/:id
   */
  async updateExpense(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updates = req.body;

      const existing = await ExpenseModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or you do not have permission to edit it.'
        });
      }

      const updated = await ExpenseModel.update(id, userId, updates);

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete an expense
   * DELETE /api/expenses/:id
   */
  async deleteExpense(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existing = await ExpenseModel.findById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or you do not have permission to delete it.'
        });
      }

      await ExpenseModel.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ExpenseController;
