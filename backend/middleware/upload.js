const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ─── Cloudinary Storage Engine ────────────────────────────────────────────────
// All uploads go to the "campusconnect" folder in Cloudinary.
// Cloudinary handles resizing, CDN delivery and persistent storage.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine subfolder based on the route
    let folder = 'campusconnect/misc';
    if (req.baseUrl.includes('auth'))   folder = 'campusconnect/profiles';
    if (req.baseUrl.includes('events')) folder = 'campusconnect/events';
    if (req.baseUrl.includes('clubs'))  folder = 'campusconnect/clubs';

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMime = /^image\/(jpeg|jpg|png|gif|webp)$/;
  if (allowedMime.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
};

// ─── Multer Instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

exports.uploadImage  = upload;
exports.uploadSingle = upload.single('image');
exports.uploadFields = (fields) => upload.fields(fields);
