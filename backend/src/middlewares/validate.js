const { errorResponse } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return errorResponse(res, 'Validation failed', 400, error.errors);
  }
};

module.exports = validate;
