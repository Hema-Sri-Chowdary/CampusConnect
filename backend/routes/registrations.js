const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { authorize, isVerified } = require('../middleware/roleCheck');

router.post('/register', protect, isVerified, registrationController.register);
router.get('/my', protect, registrationController.getMyRegistrations);
router.get('/:id', protect, registrationController.getRegistration);
router.put('/:id/cancel', protect, registrationController.cancelRegistration);
router.put('/:id/approve', protect, authorize('coordinator', 'admin'), registrationController.approveRegistration);

module.exports = router;
