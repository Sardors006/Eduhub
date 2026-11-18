const nodemailer = require('nodemailer');

const logVerificationCodeToTerminal = (email, code) => {
  console.log('\n======================================================');
  console.log('  [EduHub Pochta Xizmati] Tasdiqlash kodi yuborildi');
  console.log(`  Qabul qiluvchi : ${email}`);
  console.log(`  6 xonali kod   : ${code}`);
  console.log('  Amal qilish    : 10 daqiqa');
  console.log('======================================================\n');
};

const sendVerificationEmail = async (toEmail, code) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NODE_ENV } = process.env;

  const isSmtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

  if (NODE_ENV !== 'production' || !isSmtpConfigured) {
    logVerificationCodeToTerminal(toEmail, code);
  }

  if (!isSmtpConfigured) {
    return { deliveredVia: 'console' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: SMTP_FROM || `"EduHub" <${SMTP_USER}>`,
    to: toEmail,
    subject: 'EduHub hisobingizni tasdiqlang — 6 xonali xavfsizlik kodi',
    text: `EduHub platformasiga xush kelibsiz!\n\nSizning 6 xonali tasdiqlash kodingiz: ${code}\n\nKod 10 daqiqa davomida amal qiladi. Agar ro‘yxatdan o‘tmagan bo‘lsangiz, ushbu xabarni e’tiborsiz qoldiring.`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 22px;">EduHub hisobingizni tasdiqlang</h2>
        <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
          Hisobingizni faollashtirish uchun quyidagi 6 xonali tasdiqlash kodini kiriting. Kod <strong>10 daqiqa</strong> amal qiladi.
        </p>
        <div style="background: #ffffff; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #4f46e5;">${code}</span>
        </div>
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">
          Agar ushbu kodni siz so‘ramagan bo‘lsangiz, xabarni e’tiborsiz qoldiring.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { deliveredVia: 'smtp' };
  } catch (error) {
    console.warn(`[EduHub Pochta Xizmati] SMTP yuborishda xatolik (${error.message}). Terminalga chiqarildi.`);
    if (NODE_ENV === 'production') {
      throw new Error('Tasdiqlash xatini yuborib bo‘lmadi');
    }
    logVerificationCodeToTerminal(toEmail, code);
    return { deliveredVia: 'console-fallback' };
  }
};

module.exports = { sendVerificationEmail };
