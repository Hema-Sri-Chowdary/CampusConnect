// Vercel serverless entry point
// Exports the Express app without calling app.listen() (Vercel handles that)
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('../routes/auth');
const eventRoutes = require('../routes/events');
const registrationRoutes = require('../routes/registrations');
const paymentRoutes = require('../routes/payments');
const clubRoutes = require('../routes/clubs');
const notificationRoutes = require('../routes/notifications');
const certificateRoutes = require('../routes/certificates');
const adminRoutes = require('../routes/admin');

// Import passport config
require('../config/passport');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ─── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// Allow any *.vercel.app origin in production (preview & production deployments)
const isVercelOrigin = (origin) =>
  origin && /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isVercelOrigin(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many auth attempts, please try again later.' } });

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'CampusConnect API is running', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

app.get('/api', (req, res) => {
  res.json({ success: true, name: 'CampusConnect API', version: '1.0.0' });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── MongoDB Connection (cached for serverless) ───────────────────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Wrap handler to ensure DB is connected on every cold start
const handler = async (req, res) => {
  await connectDB();
  return app(req, res);
};

module.exports = handler;
