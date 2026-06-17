const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/clubs', adminController.getAllClubs);
router.put('/users/:id/toggle-active', adminController.toggleUserActive);
router.delete('/users/:id', adminController.deleteUser);
router.put('/clubs/:id/approve', adminController.approveClub);
router.put('/coordinators/:id/approve', adminController.approveCoordinator);

module.exports = router;
