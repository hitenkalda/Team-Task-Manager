const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return errorResponse(res, 'Email already exists', 409);

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, 'Refresh token required', 400);

    const user = await User.findOne({ refreshToken });
    if (!user) return errorResponse(res, 'Invalid refresh token', 403);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return errorResponse(res, 'Invalid refresh token', 403);
      const accessToken = generateAccessToken(user);
      successResponse(res, { accessToken }, 'Token refreshed');
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    successResponse(res, user, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};
