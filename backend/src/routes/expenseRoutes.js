const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateExpense, validateExpenseUpdate } = require('../validators/expenseValidator');

// All expense routes require authentication
router.use(authenticateToken);

router.get('/', ExpenseController.getExpenses);
router.get('/:id', ExpenseController.getExpenseById);
router.post('/', validateExpense, ExpenseController.createExpense);
router.put('/:id', validateExpenseUpdate, ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;
