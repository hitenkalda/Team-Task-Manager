const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return errorResponse(res, 'Access token required', 401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return errorResponse(res, 'Invalid or expired token', 403);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
