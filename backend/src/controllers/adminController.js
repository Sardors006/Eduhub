const User = require('../models/User');
const Course = require('../models/Course');

/**
 * GET /admin/dashboard (Faqat Administrator)
 */
const getDashboardAnalytics = async (_req, res) => {
  try {
    const [totalUsers, verifiedUsers, totalCourses, recentCourses] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Course.countDocuments(),
      Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'email role'),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        verifiedUsers,
        totalCourses,
        recentCourses,
      },
      totalUsers,
      verifiedUsers,
      totalCourses,
      recentCourses,
    });
  } catch (error) {
    console.error('[Admin Dashboard Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Boshqaruv paneli statistikalarini yuklashda xatolik yuz berdi.',
    });
  }
};

module.exports = {
  getDashboardAnalytics,
};
