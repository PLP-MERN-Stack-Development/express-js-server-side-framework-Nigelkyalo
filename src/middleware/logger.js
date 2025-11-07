// src/middleware/logger.js
// Simple request logger middleware

module.exports = function logger(req, res, next) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.ip} ${req.method} ${req.originalUrl}`);
  next();
};
