// src/middleware/validateProduct.js
// Validation middleware for creating/updating products

const ApiError = require('../errors/ApiError');

function validateProduct(req, res, next) {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string') errors.push('name is required and must be a string');
  if (!description || typeof description !== 'string') errors.push('description is required and must be a string');
  if (price === undefined || typeof price !== 'number' || Number.isNaN(price)) errors.push('price is required and must be a number');
  if (!category || typeof category !== 'string') errors.push('category is required and must be a string');
  if (inStock === undefined || typeof inStock !== 'boolean') errors.push('inStock is required and must be a boolean');

  if (errors.length) {
    return next(new ApiError(400, `Validation failed: ${errors.join('; ')}`));
  }
  next();
}

module.exports = validateProduct;
