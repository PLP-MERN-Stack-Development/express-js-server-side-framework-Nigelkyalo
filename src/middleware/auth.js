// src/middleware/auth.js
// Simple API key authentication middleware

const ApiError = require('../errors/ApiError');

module.exports = function auth(req, res, next) {
  const provided = req.header('x-api-key') || req.header('api-key');
  const expected = process.env.API_KEY || 'secret123';
  if (!provided) {
    return next(new ApiError(401, 'API key required in x-api-key header'));
  }
  if (provided !== expected) {
    return next(new ApiError(403, 'Invalid API key'));
  }
  next();
};
