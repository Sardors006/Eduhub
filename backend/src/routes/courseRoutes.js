const express = require('express');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Public catalog endpoints
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected Admin-only CRUD endpoints
router.post('/', authMiddleware, roleMiddleware('admin'), createCourse);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteCourse);

module.exports = router;

