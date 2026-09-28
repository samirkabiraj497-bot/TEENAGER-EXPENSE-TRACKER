const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Icon name cannot exceed 50 characters.'),
  handleValidationErrors
];

module.exports = { validateCategory };
