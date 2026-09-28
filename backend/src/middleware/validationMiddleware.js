const { validationResult } = require('express-validator');

/**
 * Middleware that runs after express-validator validation chains.
 * If validation fails, responds with 400 and structured error details.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: errorList[0].message || 'Validation failed. Please check your inputs.',
      errors: errorList
    });
  }
  next();
}

module.exports = {
  handleValidationErrors
};
