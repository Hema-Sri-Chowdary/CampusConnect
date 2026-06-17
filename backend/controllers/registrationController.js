const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { sendRegistrationConfirmEmail } = require('../utils/sendEmail');

// Generate unique registration number
const generateRegNumber = () => `CC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

// POST /api/registrations/register
exports.register = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (new Date() > event.registrationDeadline) return res.status(400).json({ success: false, message: 'Registration deadline has passed.' });
    if (event.status !== 'published') return res.status(400).json({ success: false, message: 'Event is not open for registration.' });
    const existing = await Registration.findOne({ userId, eventId });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered for this event.' });
    const isVITAP = req.user.email.includes('@vitap') || (req.user.studentId && req.user.studentId.trim() !== '');
    const fee = event.feeStructure.isFree ? 0 : (isVITAP ? event.feeStructure.vitapFee : event.feeStructure.externalFee);
    const isFull = event.registeredCount >= event.capacity;
    const status = isFull ? 'waitlisted' : (fee > 0 ? 'pending' : 'confirmed');
    const registrationNumber = generateRegNumber();
    const qrData = JSON.stringify({ registrationNumber, eventId: eventId.toString(), userId: userId.toString() });
    const qrCode = await QRCode.toDataURL(qrData);
    const registration = await Registration.create({
      userId, eventId, status, isVITAPStudent: isVITAP, amountPaid: fee === 0 ? 0 : 0,
      registrationNumber, qrCode, qrData
    });
    if (status === 'confirmed') {
      event.registeredCount += 1;
      await event.save();
      try { await sendRegistrationConfirmEmail(req.user.email, req.user.name, event.title, registrationNumber, qrCode); } catch (_) {}
    } else if (status === 'waitlisted') {
      event.waitlistCount += 1;
      await event.save();
    }
    await Notification.create({ title: 'Registration Received', message: `Your registration for ${event.title} has been received.`, type: 'registration_success', userId, eventId });
    res.status(201).json({ success: true, message: status === 'waitlisted' ? 'Added to waitlist.' : fee > 0 ? 'Registration pending. Complete payment.' : 'Registration confirmed!', data: { registration, requiresPayment: fee > 0, fee, isVITAP } });
  } catch (err) { next(err); }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id })
      .populate('eventId', 'title banner date venue category feeStructure status mode')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (err) { next(err); }
};

// GET /api/registrations/:id
exports.getRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('eventId')
      .populate('userId', 'name email');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
    if (registration.userId._id.toString() !== req.user._id.toString() && req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.json({ success: true, data: registration });
  } catch (err) { next(err); }
};

// PUT /api/registrations/:id/cancel
exports.cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
    if (registration.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (registration.status === 'cancelled') return res.status(400).json({ success: false, message: 'Already cancelled.' });
    const event = await Event.findById(registration.eventId);
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    registration.cancellationReason = req.body.reason || '';
    await registration.save();
    if (event && registration.status !== 'waitlisted') {
      event.registeredCount = Math.max(0, event.registeredCount - 1);
      await event.save();
    }
    res.json({ success: true, message: 'Registration cancelled.' });
  } catch (err) { next(err); }
};

// PUT /api/registrations/:id/approve (coordinator)
exports.approveRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
    const event = registration.eventId;
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    registration.status = 'confirmed';
    await registration.save();
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
    await Notification.create({ title: 'Registration Approved', message: `Your registration for ${event.title} has been approved!`, type: 'registration_success', userId: registration.userId, eventId: event._id });
    res.json({ success: true, message: 'Registration approved.', data: registration });
  } catch (err) { next(err); }
};
