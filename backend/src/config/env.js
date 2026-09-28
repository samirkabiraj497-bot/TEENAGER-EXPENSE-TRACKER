const dotenv = require('dotenv');
const path = require('path');
const { randomBytes } = require('crypto');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // A secret must never be baked into source code.  An ephemeral development
  // secret keeps the local demo usable while invalidating sessions on restart.
  jwtSecret: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = config;
