const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlisted', 'attended'],
    default: 'pending'
  },
  isVITAPStudent: {
    type: Boolean,
    default: false
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  qrCode: {
    type: String,
    default: ''
  },
  qrData: {
    type: String,
    default: ''
  },
  registrationNumber: {
    type: String,
    unique: true
  },
  attendedAt: {
    type: Date,
    default: null
  },
  checkInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  certificateGenerated: {
    type: Boolean,
    default: false
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  teamName: {
    type: String,
    default: ''
  },
  teamMembers: [{
    name: String,
    email: String,
    studentId: String
  }],
  additionalInfo: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, status: 1 });
registrationSchema.index({ registrationNumber: 1 });
registrationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
