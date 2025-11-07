// src/errors/ApiError.js
class ApiError extends Error {
  constructor(statusCode = 500, message = 'Internal Server Error') {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
