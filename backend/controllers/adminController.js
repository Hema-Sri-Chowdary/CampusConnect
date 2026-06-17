const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalCoordinators, totalClubs, totalEvents, totalRegistrations, paymentsData] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'coordinator', isActive: true }),
      Club.countDocuments({ isActive: true }),
      Event.countDocuments({ status: 'published' }),
      Registration.countDocuments({ status: { $in: ['confirmed', 'attended'] } }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    const totalRevenue = paymentsData[0]?.total || 0;
    const categoryStats = await Event.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5).populate('clubId', 'clubName');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
    res.json({ success: true, data: { totalUsers, totalStudents, totalCoordinators, totalClubs, totalEvents, totalRegistrations, totalRevenue, categoryStats, recentEvents, recentUsers } });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, data: users, pagination: { total, pages: Math.ceil(total / limit), page: parseInt(page) } });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/toggle-active
exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: user });
  } catch (err) { next(err); }
};

// PUT /api/admin/clubs/:id/approve
exports.approveClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
    const coordinator = await User.findByIdAndUpdate(club.coordinatorId, { isApproved: true }, { new: true });
    res.json({ success: true, message: 'Club approved.', data: club });
  } catch (err) { next(err); }
};

// PUT /api/admin/coordinators/:id/approve
exports.approveCoordinator = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'Coordinator approved.', data: user });
  } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin.' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
};

// GET /api/admin/clubs
exports.getAllClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().populate('coordinatorId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: clubs });
  } catch (err) { next(err); }
};
