// src/utils/asyncHandler.js
// Tiny wrapper to catch async errors and forward to next()

module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
