// src/middleware/validateBook.js
const ApiError = require('../errors/ApiError');

function validateBook(req, res, next) {
  const { title, author, genre, published_year, price, in_stock, pages, publisher } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string') errors.push('title is required and must be a string');
  if (!author || typeof author !== 'string') errors.push('author is required and must be a string');
  if (!genre || typeof genre !== 'string') errors.push('genre is required and must be a string');
  if (!published_year || typeof published_year !== 'number') errors.push('published_year is required and must be a number');
  if (!price || typeof price !== 'number') errors.push('price is required and must be a number');
  if (typeof in_stock !== 'boolean') errors.push('in_stock is required and must be a boolean');
  if (!pages || typeof pages !== 'number') errors.push('pages is required and must be a number');
  if (!publisher || typeof publisher !== 'string') errors.push('publisher is required and must be a string');

  if (errors.length) {
    return next(new ApiError(400, `Validation failed: ${errors.join('; ')}`));
  }
  next();
}

module.exports = validateBook;