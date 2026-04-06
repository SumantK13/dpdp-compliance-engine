require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const auditRoutes = require('./routes/audit');
const reportsRoutes = require('./routes/reports');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — open in dev, restricted in prod
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
 /*
// Rate limiting — generous for dev
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 200,
  message: { error: 'Too many requests. Please wait a moment and try again.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
*/
// General limiter — all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  skip: (req) => req.path === '/api/health',
});

// Strict audit limiter — scan endpoint only
const auditLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 3 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Scan limit reached. Maximum 3 scans per minute.',
    suggestion: 'Please wait a moment before scanning again.'
  },
});

// Hourly audit limiter
const auditHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Hourly scan limit reached. Maximum 20 scans per hour.',
    suggestion: 'Please try again later.'
  },
});

app.use('/api/', generalLimiter);
app.use('/api/audit', auditLimiter);
app.use('/api/audit', auditHourlyLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// MongoDB — optional, graceful failure
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dpdp_checker';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('⚠️  MongoDB not connected (audit history will not persist):', err.message));

const PORT = parseInt(process.env.PORT || '5001', 10);

const server = app.listen(PORT, () => {
  console.log(`
🚀 DPDP Checker backend running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}
`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`
❌  Port ${PORT} is already in use.`);
    console.error(`
   On macOS, port 5000 is reserved by AirPlay Receiver.`);
    console.error(`   Run one of these:
`);
    console.error(`   Option A — kill whatever is on the port:`);
    console.error(`     lsof -ti :${PORT} | xargs kill -9
`);
    console.error(`   Option B — use a different port:`);
    console.error(`     1. Edit backend/.env  →  PORT=5001`);
    console.error(`     2. Edit frontend/.env →  REACT_APP_API_URL=http://localhost:5001/api
`);
    process.exit(1);
  }
  throw err;
});
