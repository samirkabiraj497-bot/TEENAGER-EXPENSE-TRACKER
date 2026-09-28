const { body, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const VALID_PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'];

const validateExpense = [
  body('title')
    .trim()
    .notEmpty().withMessage('Expense title is required.')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number greater than zero.'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.'),
  body('expense_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid date format. Expected YYYY-MM-DD.'),
  body('payment_method')
    .optional({ checkFalsy: true })
    .isIn(VALID_PAYMENT_METHODS).withMessage(`Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  handleValidationErrors
];

const validateExpenseUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Expense title cannot be empty.')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number greater than zero.'),
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty.'),
  body('expense_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid date format. Expected YYYY-MM-DD.'),
  body('payment_method')
    .optional({ checkFalsy: true })
    .isIn(VALID_PAYMENT_METHODS).withMessage(`Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  handleValidationErrors
];

module.exports = {
  validateExpense,
  validateExpenseUpdate
};
