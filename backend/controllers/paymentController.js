const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { sendPaymentSuccessEmail } = require('../utils/sendEmail');
const { sendRegistrationConfirmEmail } = require('../utils/sendEmail');

const getRazorpayInstance = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { registrationId } = req.body;
    const registration = await Registration.findById(registrationId).populate('eventId');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
    if (registration.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const event = registration.eventId;
    const isVITAP = registration.isVITAPStudent;
    const amount = isVITAP ? event.feeStructure.vitapFee : event.feeStructure.externalFee;
    if (amount <= 0) return res.status(400).json({ success: false, message: 'No payment required for this event.' });
    const razorpay = getRazorpayInstance();
    const receipt = `cc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt,
      notes: { registrationId: registrationId.toString(), eventId: event._id.toString(), userId: req.user._id.toString() }
    });
    const payment = await Payment.create({
      userId: req.user._id,
      eventId: event._id,
      registrationId,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      receipt,
      status: 'created',
      notes: { eventTitle: event.title, userName: req.user.name }
    });
    res.json({
      success: true,
      data: { orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, paymentDbId: payment._id, event: { title: event.title, date: event.date } }
    });
  } catch (err) { next(err); }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDbId, registrationId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSignature !== razorpay_signature) {
      await Payment.findByIdAndUpdate(paymentDbId, { status: 'failed', failureReason: 'Signature verification failed' });
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }
    const payment = await Payment.findByIdAndUpdate(paymentDbId, {
      status: 'paid', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature
    }, { new: true });
    const registration = await Registration.findByIdAndUpdate(registrationId, {
      status: 'confirmed', paymentId: payment._id, amountPaid: payment.amount
    }, { new: true }).populate('eventId');
    const event = registration.eventId;
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
    try {
      await sendPaymentSuccessEmail(req.user.email, req.user.name, event.title, payment.amount, razorpay_payment_id);
      await sendRegistrationConfirmEmail(req.user.email, req.user.name, event.title, registration.registrationNumber, registration.qrCode);
    } catch (_) {}
    await Notification.create({ title: 'Payment Successful', message: `Payment of ₹${payment.amount} for ${event.title} was successful!`, type: 'payment_success', userId: req.user._id, eventId: event._id });
    res.json({ success: true, message: 'Payment verified. Registration confirmed!', data: { payment, registration } });
  } catch (err) { next(err); }
};

// GET /api/payments/my
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('eventId', 'title date venue')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) { next(err); }
};

// GET /api/payments/event/:eventId (coordinator)
exports.getEventPayments = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const payments = await Payment.find({ eventId: req.params.eventId, status: 'paid' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ success: true, data: payments, totalRevenue });
  } catch (err) { next(err); }
};
