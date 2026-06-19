const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const getImageUrl = require('../utils/getImageUrl');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  banner: {
    type: String,
    default: '',
    get: getImageUrl
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['technical', 'coding', 'hackathon', 'workshop', 'cultural', 'sports',
      'entrepreneurship', 'ai-ml', 'robotics', 'other']
  },
  tags: [{ type: String, trim: true }],
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Club is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: {
    type: Date
  },
  time: {
    start: { type: String, required: [true, 'Start time is required'] },
    end: { type: String }
  },
  venue: {
    name: { type: String, required: [true, 'Venue is required'] },
    address: { type: String, default: '' },
    mapLink: { type: String, default: '' }
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    required: [true, 'Event mode is required']
  },
  onlineLink: {
    type: String,
    default: ''
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  waitlistCount: {
    type: Number,
    default: 0
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  feeStructure: {
    isFree: { type: Boolean, default: true },
    vitapFee: { type: Number, default: 0, min: 0 },
    externalFee: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' }
  },
  contact: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  highlights: [{ type: String }],
  requirements: [{ type: String }],
  prizes: [{
    position: String,
    prize: String
  }],
  schedule: [{
    time: String,
    activity: String
  }],
  faqs: [{
    question: String,
    answer: String
  }],
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
eventSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.capacity - this.registeredCount);
});

eventSchema.virtual('isFull').get(function () {
  return this.registeredCount >= this.capacity;
});

eventSchema.virtual('isRegistrationOpen').get(function () {
  return new Date() <= this.registrationDeadline && this.status === 'published';
});

eventSchema.virtual('isUpcoming').get(function () {
  return new Date() < this.date;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ clubId: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ registrationDeadline: 1 });

eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', eventSchema);
