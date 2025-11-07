const ApiError = require('./ApiError');

class ValidationError extends ApiError {
  constructor(message = 'Validation failed') {
    super(400, message);
  }
}

module.exports = ValidationError;
