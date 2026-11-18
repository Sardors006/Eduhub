const { verifyAccessToken } = require('../utils/tokenUtils');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Ruxsat etilmagan: Avtorizatsiya sarlavhasi topilmadi.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Ruxsat etilmagan: Kirish tokeni talab qilinadi.',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Ruxsat etilmagan: Kirish tokenining muddati tugagan.'
        : 'Ruxsat etilmagan: Kirish tokeni yaroqsiz.';

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = authMiddleware;
