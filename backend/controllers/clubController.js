const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const slugify = require('slugify');

// GET /api/clubs
exports.getClubs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isApproved: true, isActive: true };
    if (category) query.category = category;
    if (search) query.clubName = { $regex: search, $options: 'i' };
    const clubs = await Club.find(query)
      .populate('coordinatorId', 'name email profilePicture')
      .sort({ clubName: 1 });
    res.json({ success: true, data: clubs });
  } catch (err) { next(err); }
};

// GET /api/clubs/:id
exports.getClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('coordinatorId', 'name email profilePicture');
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
    const events = await Event.find({ clubId: req.params.id, status: 'published' }).sort({ date: 1 }).limit(10);
    res.json({ success: true, data: { club, events } });
  } catch (err) { next(err); }
};

// POST /api/clubs
exports.createClub = async (req, res, next) => {
  try {
    const { clubName } = req.body;
    const slug = slugify(clubName, { lower: true, strict: true });
    const logoPath = req.file ? req.file.path : ''; // Cloudinary CDN URL
    const club = await Club.create({ ...req.body, slug, coordinatorId: req.user._id, logo: logoPath, isApproved: req.user.role === 'admin' });
    await User.findByIdAndUpdate(req.user._id, { clubId: club._id });
    res.status(201).json({ success: true, message: 'Club created. Pending admin approval.', data: club });
  } catch (err) { next(err); }
};

// PUT /api/clubs/:id
exports.updateClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
    if (club.coordinatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (req.file) req.body.logo = req.file.path; // Cloudinary CDN URL
    const updated = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Club updated.', data: updated });
  } catch (err) { next(err); }
};

// GET /api/clubs/my
exports.getMyClub = async (req, res, next) => {
  try {
    const clubs = await Club.find({ _id: { $in: req.user.managedClubs } })
      .populate('coordinatorId', 'name email profilePicture');
    res.json({ success: true, data: clubs });
  } catch (err) { next(err); }
};
