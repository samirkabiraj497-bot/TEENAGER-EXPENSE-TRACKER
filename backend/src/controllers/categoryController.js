const CategoryModel = require('../models/categoryModel');

const CategoryController = {
  /**
   * Get all expense categories
   * GET /api/categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await CategoryModel.getAll();
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Add a new category
   * POST /api/categories
   */
  async createCategory(req, res, next) {
    try {
      const { name, icon } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required.'
        });
      }

      const category = await CategoryModel.create({ name, icon });
      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = CategoryController;
