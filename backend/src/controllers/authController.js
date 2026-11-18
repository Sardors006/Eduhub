const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshCookieOptions,
} = require('../utils/tokenUtils');
const { sendVerificationEmail } = require('../utils/sendEmail');

const SALT_ROUNDS = 12;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const generateSixDigitCode = () => crypto.randomInt(100000, 1000000).toString();

/**
 * POST /auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Elektron pochta va parol kiritilishi shart.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Iltimos, to‘g‘ri elektron pochta manzilini kiriting.',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: 'Bu elektron pochta bilan hisob allaqachon mavjud. Iltimos, tizimga kiring.',
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS);
    const verificationCode = generateSixDigitCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    let user;
    if (existingUser && !existingUser.isVerified) {
      existingUser.password = hashedPassword;
      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpires = verificationCodeExpires;
      user = await existingUser.save();
    } else {
      user = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        isVerified: false,
        verificationCode,
        verificationCodeExpires,
      });
    }

    await sendVerificationEmail(user.email, verificationCode);

    return res.status(201).json({
      success: true,
      message:
        'Hisob yaratildi! 6 xonali tasdiqlash kodi elektron pochtangizga (va lokal rejimda server terminaliga) yuborildi.',
      email: user.email,
    });
  } catch (error) {
    console.error('[Auth Register Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Ro‘yxatdan o‘tishda xatolik yuz berdi. Qayta urinib ko‘ring.',
    });
  }
};

/**
 * POST /auth/verify
 */
const verify = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Elektron pochta va 6 xonali tasdiqlash kodi talab qilinadi.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(code).trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      return res.status(400).json({
        success: false,
        message: 'Tasdiqlash kodi aniq 6 ta raqamdan iborat bo‘lishi kerak.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu elektron pochta bo‘yicha hisob topilmadi.',
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Elektron pochta allaqachon tasdiqlangan. Tizimga kirishingiz mumkin.',
      });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({
        success: false,
        message: 'Faol tasdiqlash kodi topilmadi. Iltimos, yangi kod so‘rang.',
      });
    }

    if (user.verificationCodeExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Tasdiqlash kodining muddati tugagan. Iltimos, yangi kod so‘rang.',
      });
    }

    if (user.verificationCode !== normalizedCode) {
      return res.status(400).json({
        success: false,
        message: 'Tasdiqlash kodi noto‘g‘ri. 6 xonali kodni tekshirib qayta kiriting.',
      });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Elektron pochta muvaffaqiyatli tasdiqlandi! Endi tizimga kirishingiz mumkin.',
    });
  } catch (error) {
    console.error('[Auth Verify Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Tasdiqlashda xatolik yuz berdi. Qayta urinib ko‘ring.',
    });
  }
};

/**
 * POST /auth/resend-code
 */
const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Elektron pochta manzili kiritilishi shart.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu elektron pochta bo‘yicha hisob topilmadi.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Bu elektron pochta manzili allaqachon tasdiqlangan.',
      });
    }

    const verificationCode = generateSixDigitCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, verificationCode);

    return res.status(200).json({
      success: true,
      message: 'Yangi 6 xonali tasdiqlash kodi yuborildi.',
    });
  } catch (error) {
    console.error('[Auth Resend Code Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Tasdiqlash kodini qayta yuborishda xatolik yuz berdi.',
    });
  }
};

/**
 * POST /auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Elektron pochta va parol kiritilishi shart.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Elektron pochta yoki parol noto‘g‘ri.',
      });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Elektron pochta yoki parol noto‘g‘ri.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Tizimga kirishdan oldin elektron pochtangizni tasdiqlang.',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      accessToken,
      issuedAt: new Date().toISOString(),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Tizimga kirishda xatolik yuz berdi. Qayta urinib ko‘ring.',
    });
  }
};

/**
 * POST /auth/refresh
 */
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Yangilash tokeni topilmadi. Iltimos, qayta tizimga kiring.',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (_err) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(401).json({
        success: false,
        message: 'Yangilash tokeni yaroqsiz yoki muddati tugagan. Qayta tizimga kiring.',
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.refreshToken || user.refreshToken !== token) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(401).json({
        success: false,
        message: 'Sessiya bekor qilingan yoki tanilmadi. Qayta tizimga kiring.',
      });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      issuedAt: new Date().toISOString(),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth Refresh Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Sessiyani yangilashda xatolik yuz berdi.',
    });
  }
};

/**
 * POST /auth/logout
 */
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await User.findOneAndUpdate(
        { refreshToken: token },
        { $set: { refreshToken: null } }
      );
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      success: true,
      message: 'Tizimdan muvaffaqiyatli chiqdingiz.',
    });
  } catch (error) {
    console.error('[Auth Logout Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Tizimdan chiqishda xatolik yuz berdi.',
    });
  }
};

/**
 * GET /profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -refreshToken -verificationCode -verificationCodeExpires'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi profili topilmadi.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Get Profile Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Profil ma’lumotlarini yuklashda xatolik yuz berdi.',
    });
  }
};

module.exports = {
  register,
  verify,
  resendCode,
  login,
  refresh,
  logout,
  getProfile,
};
