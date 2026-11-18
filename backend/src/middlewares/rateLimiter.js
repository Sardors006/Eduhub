const { rateLimit } = require('express-rate-limit');
const { slowDown } = require('express-slow-down');

/**
 * Kirish uchun qat’iy limit: har bir IP dan 1 daqiqada ko‘pi bilan 5 ta so‘rov.
 */
const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const resetTime = req.rateLimit?.resetTime
      ? Math.max(1, Math.ceil((new Date(req.rateLimit.resetTime).getTime() - Date.now()) / 1000))
      : 60;

    res.status(options.statusCode).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Juda ko‘p kirish urinishi qilindi. 1 daqiqada ko‘pi bilan 5 ta urinishga ruxsat beriladi. Iltimos, ${resetTime} soniyadan so‘ng qayta urinib ko‘ring.`,
      retryAfterSeconds: resetTime,
    });
  },
});

/**
 * Umumiy API himoyasi (DDoS va haddan tashqari so‘rovlarga qarshi).
 */
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    code: 'GLOBAL_RATE_LIMIT',
    message: 'So‘rovlar soni me’yoridan oshib ketdi. Birozdan so‘ng qayta urinib ko‘ring.',
  },
});

/**
 * So‘rovlarni bosqichma-bosqich sekinlashtirish himoyasi.
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 60,
  delayMs: (used, req) => (used - req.slowDown.limit) * 100,
  maxDelayMs: 2000,
});

module.exports = {
  loginRateLimiter,
  globalRateLimiter,
  speedLimiter,
};
