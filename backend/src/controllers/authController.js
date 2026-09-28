const UserModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const AuthController = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please log in.'
        });
      }

      // Hash password using bcrypt
      const password_hash = await hashPassword(password);

      // Create user record
      const newUser = await UserModel.create({
        name,
        email,
        password_hash
      });

      // Generate JWT token
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to TeenSpend.',
        data: {
          user: newUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Log in an existing user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Verify password with bcrypt
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Generate JWT
      const token = generateToken({
        userId: user.id,
        email: user.email
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current authenticated user details
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
