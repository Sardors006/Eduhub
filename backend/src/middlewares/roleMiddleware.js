const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Ruxsat etilmagan: Avval tizimga kiring.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Taqiqlangan: Bu bo‘limga faqat administratorlar kira oladi.',
      });
    }

    return next();
  };
};

module.exports = roleMiddleware;
