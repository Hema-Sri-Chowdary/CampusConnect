const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, certificateController.getMyCertificates);
router.get('/verify/:code', certificateController.verifyCertificate);
router.post('/generate/:registrationId', protect, certificateController.generateCertificate);
router.get('/:id/download', protect, certificateController.downloadCertificate);

module.exports = router;
