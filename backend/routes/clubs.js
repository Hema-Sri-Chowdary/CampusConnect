const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { uploadSingle } = require('../middleware/upload');

router.get('/', clubController.getClubs);
router.get('/my', protect, authorize('coordinator'), clubController.getMyClub);
router.get('/:id', clubController.getClub);
router.post('/', protect, authorize('coordinator', 'admin'), uploadSingle, clubController.createClub);
router.put('/:id', protect, authorize('coordinator', 'admin'), uploadSingle, clubController.updateClub);

module.exports = router;
