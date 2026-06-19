const Event = require('../models/Event');
const Club = require('../models/Club');
const Registration = require('../models/Registration');
const slugify = require('slugify');

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { search, category, club, mode, isFree, date, sort = 'date', page = 1, limit = 12 } = req.query;
    const query = { status: 'published' };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (club) query.clubId = club;
    if (mode) query.mode = mode;
    if (isFree === 'true') query['feeStructure.isFree'] = true;
    if (isFree === 'false') query['feeStructure.isFree'] = false;
    if (date === 'upcoming') query.date = { $gte: new Date() };
    if (date === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const sortOptions = {};
    if (sort === 'date') sortOptions.date = 1;
    else if (sort === 'popular') sortOptions.registeredCount = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'views') sortOptions.viewCount = -1;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: [{ path: 'clubId', select: 'clubName logo category' }, { path: 'organizer', select: 'name profilePicture' }]
    };
    const result = await Event.paginate(query, options);
    res.json({ success: true, data: result.docs, pagination: { total: result.totalDocs, pages: result.totalPages, page: result.page, limit: result.limit } });
  } catch (err) { next(err); }
};

// GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'clubName logo description category socialLinks contactEmail')
      .populate('organizer', 'name profilePicture email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    event.viewCount += 1;
    await event.save();
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

// POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const coordinator = req.user;
    const club = await Club.findOne({ coordinatorId: coordinator._id });
    if (!club) return res.status(400).json({ success: false, message: 'No club associated with your account.' });

    // Validate dates are not in the past
    const now = new Date();
    if (req.body.date && new Date(req.body.date) < now) {
      return res.status(400).json({ success: false, message: 'Event date cannot be in the past.' });
    }
    if (req.body.registrationDeadline && new Date(req.body.registrationDeadline) < now) {
      return res.status(400).json({ success: false, message: 'Registration deadline cannot be in the past.' });
    }

    const { title } = req.body;
    let slug = slugify(title, { lower: true, strict: true });
    const existing = await Event.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;
    const bannerPath = req.file ? req.file.path : ''; // Cloudinary CDN URL
    const event = await Event.create({ ...req.body, slug, clubId: club._id, organizer: coordinator._id, banner: bannerPath });
    await Club.findByIdAndUpdate(club._id, { $inc: { totalEvents: 1 } });
    res.status(201).json({ success: true, message: 'Event created successfully.', data: event });
  } catch (err) { next(err); }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event.' });
    }
    // Validate dates are not in the past
    const now = new Date();
    if (req.body.date && new Date(req.body.date) < now) {
      return res.status(400).json({ success: false, message: 'Event date cannot be in the past.' });
    }
    if (req.body.registrationDeadline && new Date(req.body.registrationDeadline) < now) {
      return res.status(400).json({ success: false, message: 'Registration deadline cannot be in the past.' });
    }
    if (req.file) req.body.banner = req.file.path; // Cloudinary CDN URL
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Event updated.', data: updated });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event.' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) { next(err); }
};

// GET /api/events/my/events (coordinator)
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// GET /api/events/:id/participants (coordinator)
exports.getEventParticipants = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const registrations = await Registration.find({ eventId: req.params.id })
      .populate('userId', 'name email phone college studentId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (err) { next(err); }
};

// POST /api/events/:id/checkin
exports.checkIn = async (req, res, next) => {
  try {
    const { registrationNumber } = req.body;
    const registration = await Registration.findOne({ registrationNumber, eventId: req.params.id });
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
    if (registration.attendedAt) return res.status(400).json({ success: false, message: 'Already checked in.' });
    registration.attendedAt = new Date();
    registration.status = 'attended';
    registration.checkInBy = req.user._id;
    await registration.save();
    const user = await require('../models/User').findById(registration.userId).select('name email');
    res.json({ success: true, message: 'Check-in successful!', data: { user, registration } });
  } catch (err) { next(err); }
};
