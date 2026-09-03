const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  me,
  refresh,
  updateProfile,
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);

module.exports = router;