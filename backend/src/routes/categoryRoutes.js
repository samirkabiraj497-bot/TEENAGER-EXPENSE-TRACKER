const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateCategory } = require('../validators/categoryValidator');

router.get('/', CategoryController.getCategories);
router.post('/', authenticateToken, validateCategory, CategoryController.createCategory);

module.exports = router;
