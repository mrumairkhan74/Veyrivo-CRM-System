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
const { validateSchema, schemas } = require('../middleware/validators');
const router = express.Router();

// Public routes
router.post('/register', validateSchema(schemas.register), register);
router.post('/login', validateSchema(schemas.login), login);
router.post('/logout', logout);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);

module.exports = router;