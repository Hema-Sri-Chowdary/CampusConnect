const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Club description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logo: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['technical', 'non-technical', 'regional', 'professional', 'social_outreach', 'other'],
    default: 'other'
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  coCoordinators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  contactEmail: {
    type: String,
    trim: true
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  totalMembers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
clubSchema.index({ clubName: 1 });
clubSchema.index({ slug: 1 });
clubSchema.index({ coordinatorId: 1 });
clubSchema.index({ isApproved: 1, isActive: 1 });

module.exports = mongoose.model('Club', clubSchema);
