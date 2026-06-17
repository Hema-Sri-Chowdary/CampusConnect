const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/my', protect, paymentController.getMyPayments);
router.get('/event/:eventId', protect, authorize('coordinator', 'admin'), paymentController.getEventPayments);

module.exports = router;
