const mongoose = require('mongoose');
const Course = require('../models/Course');

/**
 * GET /courses (Ommaviy)
 */
const getAllCourses = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (category && category !== 'All' && category !== 'Barchasi') {
      filter.category = category;
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { instructor: regex },
        { category: regex },
      ];
    }

    const courses = await Course.find(filter)
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error('[Get Courses Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Kurslar ro‘yxatini olishda xatolik yuz berdi.',
    });
  }
};

/**
 * GET /courses/:id (Ommaviy)
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Kurs identifikatori noto‘g‘ri formatda.',
      });
    }

    const course = await Course.findById(id).populate('createdBy', 'email role');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi.',
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error('[Get Course By ID Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Kurs ma’lumotlarini olishda xatolik yuz berdi.',
    });
  }
};

/**
 * POST /courses (Faqat Administrator)
 */
const createCourse = async (req, res) => {
  try {
    const { title, description, instructor, price, category } = req.body;

    if (!title || !description || !instructor || price === undefined || price === '' || !category) {
      return res.status(400).json({
        success: false,
        message: 'Barcha maydonlar (nomi, tavsifi, o‘qituvchi, narxi, yo‘nalishi) to‘ldirilishi shart.',
      });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Narx manfiy bo‘lmagan to‘g‘ri raqam bo‘lishi kerak.',
      });
    }

    const course = await Course.create({
      title: String(title).trim(),
      description: String(description).trim(),
      instructor: String(instructor).trim(),
      price: numericPrice,
      category: String(category).trim(),
      createdBy: req.user.id,
    });

    const populated = await course.populate('createdBy', 'email role');

    return res.status(201).json({
      success: true,
      message: 'Kurs muvaffaqiyatli yaratildi.',
      course: populated,
    });
  } catch (error) {
    console.error('[Create Course Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Kurs yaratishda xatolik yuz berdi.',
    });
  }
};

/**
 * PUT /courses/:id (Faqat Administrator)
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Kurs identifikatori noto‘g‘ri formatda.',
      });
    }

    const { title, description, instructor, price, category } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = String(title).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (instructor !== undefined) updates.instructor = String(instructor).trim();
    if (category !== undefined) updates.category = String(category).trim();

    if (price !== undefined && price !== '') {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Narx manfiy bo‘lmagan to‘g‘ri raqam bo‘lishi kerak.',
        });
      }
      updates.price = numericPrice;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'email role');

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kurs muvaffaqiyatli yangilandi.',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('[Update Course Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Kursni yangilashda xatolik yuz berdi.',
    });
  }
};

/**
 * DELETE /courses/:id (Faqat Administrator)
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Kurs identifikatori noto‘g‘ri formatda.',
      });
    }

    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kurs muvaffaqiyatli o‘chirildi.',
      deletedId: id,
    });
  } catch (error) {
    console.error('[Delete Course Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Kursni o‘chirishda xatolik yuz berdi.',
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
