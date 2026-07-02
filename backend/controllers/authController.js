const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, getOTPExpiry } = require('../utils/generateOTP');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.toPublicJSON ? user.toPublicJSON() : user
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, college, studentId, role, managedClubs } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const allowedRoles = ['student', 'coordinator'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    // Validate coordinator email domain and club selection
    const VIT_DOMAINS = ['@vitapstudent.ac.in', '@vitap.ac.in', '@vit.ac.in'];
    if (userRole === 'coordinator') {
      if (!VIT_DOMAINS.some(d => email.endsWith(d))) {
        return res.status(400).json({ success: false, message: 'Coordinators must register with a VIT email (@vitapstudent.ac.in, @vitap.ac.in, or @vit.ac.in).' });
      }
      if (!Array.isArray(managedClubs) || managedClubs.length === 0) {
        return res.status(400).json({ success: false, message: 'Coordinators must select at least one club.' });
      }
      if (managedClubs.length > 5) {
        return res.status(400).json({ success: false, message: 'Coordinators can register for a maximum of 5 clubs.' });
      }
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    const userData = {
      name, email, password, college,
      role: userRole,
      isApproved: true,
      otp: { code: otp, expiresAt: otpExpiry }
    };
    // Only include optional fields when they have values
    if (phone) userData.phone = phone;
    if (studentId) userData.studentId = studentId;
    if (userRole === 'coordinator') {
      userData.managedClubs = managedClubs;
    }

    const user = await User.create(userData);

    if (userRole === 'coordinator' && Array.isArray(managedClubs) && managedClubs.length > 0) {
      const Club = require('../models/Club');
      await Promise.all(managedClubs.map(async (clubId) => {
        const c = await Club.findById(clubId);
        if (c) {
          if (!c.coordinatorId) {
            c.coordinatorId = user._id;
          }
          if (!c.coCoordinators.includes(user._id)) {
            c.coCoordinators.push(user._id);
          }
          await c.save();
        }
      }));
    }
    
    let emailSent = true;
    try {
      await sendOTPEmail(email, name, otp);
    } catch (err) {
      emailSent = false;
      console.error('❌ Email transporter failed to send registration OTP:', err.message);
      console.log(`🔑 [DEVELOPMENT ONLY] Registration OTP for ${email} is: ${otp}`);
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user._id,
      // In development: include OTP directly so it shows in the verify screen only if email failed
      ...(process.env.NODE_ENV !== 'production' && !emailSent && { devOtp: otp })
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+otp.code +otp.expiresAt +otp.attempts');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified.' });
    
    if (!user.otp.code || new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (user.otp.attempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }
    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    
    user.isVerified = true;
    user.otp = { code: null, expiresAt: null, attempts: 0 };
    await user.save();
    sendTokenResponse(user, 200, res, 'Email verified successfully. Welcome to CampusConnect!');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select('+otp');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified.' });
    
    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: getOTPExpiry(), attempts: 0 };
    await user.save();
    
    let emailSent = true;
    try {
      await sendOTPEmail(user.email, user.name, otp);
    } catch (err) {
      emailSent = false;
      console.error('❌ Email transporter failed to send verification OTP:', err.message);
      console.log(`🔑 [DEVELOPMENT ONLY] Verification OTP for ${user.email} is: ${otp}`);
    }
    
    res.json({ 
      success: true, 
      message: 'OTP resent successfully.',
      ...(process.env.NODE_ENV !== 'production' && !emailSent && { devOtp: otp })
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first.', userId: user._id, requiresVerification: true });
    }
    // Validate coordinator email domain
    if (user.role === 'coordinator') {
      const VIT_DOMAINS = ['@vitapstudent.ac.in', '@vitap.ac.in', '@vit.ac.in'];
      if (!VIT_DOMAINS.some(d => email.endsWith(d))) {
        return res.status(403).json({ success: false, message: 'Coordinator login requires a VIT email (@vitapstudent.ac.in, @vitap.ac.in, or @vit.ac.in).' });
      }
    }
    user.lastLogin = new Date();
    await user.save();
    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// GET /api/auth/google/callback
exports.googleCallback = (req, res) => {
  const token = signToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
};

// POST /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (user.password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'college', 'studentId', 'year', 'branch'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.file) updates.profilePicture = req.file.path; // Cloudinary CDN URL
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist.' });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ success: false, message: 'This account was created using Google Sign-In. Please use Continue with Google.' });
    }

    const otp = generateOTP();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = getOTPExpiry();
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.name, otp);
    } catch (err) {
      console.error('❌ Email transporter failed to send reset password OTP:', err.message);
      console.log(`🔑 [DEVELOPMENT ONLY] Password reset OTP for ${user.email} is: ${otp}`);
    }

    res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email.'
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields (email, otp, newPassword) are required.' });
    }

    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }
    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new one.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/account
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // For non-Google accounts, require password confirmation
    if (!user.isGoogleUser) {
      if (!password) {
        return res.status(400).json({ success: false, message: 'Please enter your password to confirm deletion.' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Account not deleted.' });
      }
    }

    // Delete associated data from other collections
    const mongoose = require('mongoose');
    const userId = user._id;

    await Promise.allSettled([
      mongoose.connection.db.collection('registrations').deleteMany({ user: userId }),
      mongoose.connection.db.collection('payments').deleteMany({ user: userId }),
      mongoose.connection.db.collection('notifications').deleteMany({ recipient: userId }),
      mongoose.connection.db.collection('certificates').deleteMany({ user: userId }),
    ]);

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Your account has been permanently deleted.' });
  } catch (err) {
    next(err);
  }
};
