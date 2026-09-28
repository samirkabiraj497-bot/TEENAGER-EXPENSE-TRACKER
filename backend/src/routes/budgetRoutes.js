const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateBudget, validateBudgetUpdate } = require('../validators/budgetValidator');

// All budget routes require authentication
router.use(authenticateToken);

router.get('/', BudgetController.getBudgets);
router.post('/', validateBudget, BudgetController.createOrUpdateBudget);
router.put('/:id', validateBudgetUpdate, BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

module.exports = router;
