const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../schemas/authSchema');
const authenticateToken = require('../middlewares/authenticate');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
