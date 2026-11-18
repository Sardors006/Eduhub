const express = require('express');
const {
  register,
  verify,
  resendCode,
  login,
  refresh,
  logout,
} = require('../controllers/authController');
const { loginRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/verify', verify);
router.post('/resend-code', resendCode);
router.post('/login', loginRateLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;

