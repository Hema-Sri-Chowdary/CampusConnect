const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  certificateUrl: {
    type: String,
    required: true
  },
  qrVerificationCode: {
    type: String,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

certificateSchema.index({ userId: 1 });
certificateSchema.index({ eventId: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ qrVerificationCode: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
