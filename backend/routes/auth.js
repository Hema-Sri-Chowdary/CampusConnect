const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Registration & OTP
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Login
router.post('/login', authController.login);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  authController.googleCallback
);

// Protected Routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, uploadSingle, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.delete('/account', protect, authController.deleteAccount);

module.exports = router;
