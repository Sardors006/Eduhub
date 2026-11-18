require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { getProfile } = require('./controllers/authController');
const authMiddleware = require('./middlewares/authMiddleware');
const { globalRateLimiter, speedLimiter } = require('./middlewares/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// 1. Global Security Headers (Helmet)
app.use(helmet());

// 2. Strict CORS configuration with credentials enabled for HttpOnly cookies
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4. Basic DDoS Protection (Slow-down + Global Rate Limit across API routes)
app.use(speedLimiter);
app.use(globalRateLimiter);

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'EduHub API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// 5. Application Routes
app.use('/auth', authRoutes);
app.get('/profile', authMiddleware, getProfile);
app.use('/admin', adminRoutes);
app.use('/courses', courseRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// Start Server after Database Connection
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[EduHub Backend] Server running on http://localhost:${PORT}`);
    console.log(`[EduHub Backend] Accepting CORS requests from ${CLIENT_URL}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;

