const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize, isVerified, isApproved } = require('../middleware/roleCheck');
const { uploadSingle } = require('../middleware/upload');

router.get('/', optionalAuth, eventController.getEvents);
router.get('/my/events', protect, authorize('coordinator', 'admin'), eventController.getMyEvents);
router.get('/:id', optionalAuth, eventController.getEvent);
router.get('/:id/participants', protect, authorize('coordinator', 'admin'), eventController.getEventParticipants);
router.post('/:id/checkin', protect, authorize('coordinator', 'admin'), eventController.checkIn);
router.post('/', protect, authorize('coordinator', 'admin'), isVerified, isApproved, uploadSingle, eventController.createEvent);
router.put('/:id', protect, authorize('coordinator', 'admin'), isVerified, uploadSingle, eventController.updateEvent);
router.delete('/:id', protect, authorize('coordinator', 'admin'), eventController.deleteEvent);

module.exports = router;
