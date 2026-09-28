const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authRateLimit } = require('../middleware/authRateLimitMiddleware');

// Public endpoints
router.post('/register', authRateLimit, validateRegister, AuthController.register);
router.post('/login', authRateLimit, validateLogin, AuthController.login);

// Protected endpoints
router.get('/me', authenticateToken, AuthController.getMe);

module.exports = router;
