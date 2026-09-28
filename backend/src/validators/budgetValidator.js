const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const validateBudget = [
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.'),
  body('amount')
    .notEmpty().withMessage('Budget amount is required.')
    .isFloat({ gt: 0 }).withMessage('Budget amount must be greater than zero.'),
  body('month')
    .notEmpty().withMessage('Month is required.')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12.'),
  body('year')
    .notEmpty().withMessage('Year is required.')
    .isInt({ min: 2020, max: 2100 }).withMessage('Year must be valid (2020-2100).'),
  handleValidationErrors
];

const validateBudgetUpdate = [
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty.')
    .isLength({ max: 100 }).withMessage('Category cannot exceed 100 characters.'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Budget amount must be greater than zero.'),
  body().custom(value => {
    if (!value || (value.category === undefined && value.amount === undefined)) {
      throw new Error('Provide a category or amount to update.');
    }
    return true;
  }),
  handleValidationErrors
];

module.exports = {
  validateBudget,
  validateBudgetUpdate
};
