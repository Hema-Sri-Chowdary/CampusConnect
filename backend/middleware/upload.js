const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Determine if we should use Cloudinary or local disk storage
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'your_cloudinary_api_secret' &&
  process.env.CLOUDINARY_API_SECRET !== 'RS_lTMaGj2naEFdXd6uwi9GA8E8';

let storage;

if (isCloudinaryConfigured && process.env.USE_LOCAL_STORAGE !== 'true') {
  // ─── Cloudinary Storage Engine ────────────────────────────────────────────────
  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
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
} else {
  // ─── Local Disk Storage Engine ────────────────────────────────────────────────
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

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
