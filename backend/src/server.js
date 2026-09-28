const app = require('./app');
const env = require('./config/env');

const PORT = env.port || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Using an ephemeral development secret; existing sessions will end when the server restarts.');
}

if (env.nodeEnv === 'production' && !process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET must be set when NODE_ENV=production.');
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 TeenSpend API Server started successfully!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Environment: ${env.nodeEnv}`);
  console.log('========================================================');
});

// Friendly error handling for common server errors (e.g. Port in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('========================================================');
    console.error(`❌ [TeenSpend Error] Port ${PORT} is already in use!`);
    console.error(`👉 Another instance of the backend is already running.`);
    console.error(`👉 You can close the other terminal running it, or change PORT in backend/.env`);
    console.error('========================================================');
    process.exit(1);
  } else {
    console.error('❌ Server error:', err.message);
    process.exit(1);
  }
});

// Handle graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down TeenSpend server...`);
  server.close(() => {
    console.log('💤 Closed out remaining connections.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
