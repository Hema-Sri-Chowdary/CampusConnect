const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'coordinator', 'admin'],
    default: 'student'
  },
  college: {
    type: String,
    trim: true,
    default: ''
  },
  studentId: {
    type: String,
    trim: true,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    default: null
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true // coordinators need admin approval
  },
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 }
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  },
  bookmarkedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('isVITAPStudent').get(function () {
  return this.email.includes('@vitap') || (this.studentId && this.studentId.trim() !== '');
});

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: email already has a unique index via unique:true in the schema definition
userSchema.index({ role: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ studentId: 1 });

module.exports = mongoose.model('User', userSchema);
