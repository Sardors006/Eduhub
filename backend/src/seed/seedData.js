const bcrypt = require('bcrypt');
const User = require('../models/User');
const Course = require('../models/Course');

const OLD_ENGLISH_TITLES = [
  'Full-Stack Architecture with Node.js & React',
  'Applied Generative AI & LLM Engineering',
  'Design Systems & Modern SaaS UI/UX',
  'Zero-Trust Web Security & API Hardening',
  'Cloud-Native Kubernetes & DevOps Mastery',
  'Data Engineering with Python & Modern Warehouses',
];

const SAMPLE_COURSES = [
  {
    title: 'Node.js va Next.js bilan to‘liq veb-dasturlash',
    description:
      'Zamonaviy REST API, xavfsiz avtorizatsiya, MongoDB ma’lumotlar bazasi va tezkor Next.js interfeyslarini noldan real loyihagacha o‘rganing.',
    instructor: 'Azizbek Karimov',
    price: 129,
    category: 'Dasturlash',
  },
  {
    title: 'Amaliy sun’iy intellekt va neyron tarmoqlar',
    description:
      'Katta til modellari, matn va tasvir tahlili, vektorli qidiruv hamda aqlli yordamchilar yaratish bo‘yicha amaliy kurs.',
    instructor: 'Sardorbek Alimov',
    price: 159,
    category: 'Sun’iy intellekt',
  },
  {
    title: 'Zamonaviy interfeys va foydalanuvchi tajribasi dizayni',
    description:
      'Figma va Tailwind yordamida qulay, chiroyli va barcha qurilmalarga moslashuvchan dizayn tizimlarini yaratishni o‘zlashtiring.',
    instructor: 'Madina Rahimova',
    price: 99,
    category: 'Dizayn',
  },
  {
    title: 'Veb-xavfsizlik va tizimlarni himoyalash asoslari',
    description:
      'Hujumlardan himoyalanish, shifrlash, tokenlar xavfsizligi, so‘rovlar cheklovi va serverlarni mustahkamlash bo‘yicha chuqur amaliyot.',
    instructor: 'Jamshid Tursunov',
    price: 139,
    category: 'Kiberxavfsizlik',
  },
  {
    title: 'Bulutli texnologiyalar va server boshqaruvi',
    description:
      'Konteynerlar, avtomatlashtirilgan joylashtirish, monitoring va yuqori yuklamali loyihalarni uzluksiz yuritish sirlari.',
    instructor: 'Dilnoza Saidova',
    price: 149,
    category: 'Bulut texnologiyalari',
  },
  {
    title: 'Python yordamida ma’lumotlar tahlili',
    description:
      'Katta hajmdagi ma’lumotlarni tozalash, tahlil qilish, vizual hisobotlar tuzish va biznes qarorlarini qabul qilishni o‘rganing.',
    instructor: 'Bobur Islomov',
    price: 119,
    category: 'Ma’lumotlar tahlili',
  },
];

const seedInitialData = async ({ silent = false } = {}) => {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eduhub.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  let adminUser = await User.findOne({ email: adminEmail });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    adminUser = await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    });
    log(`[Baza] Administrator hisobi yaratildi: ${adminEmail} (parol: ${adminPassword})`);
  } else {
    if (adminUser.role !== 'admin' || !adminUser.isVerified) {
      adminUser.role = 'admin';
      adminUser.isVerified = true;
      await adminUser.save();
    }
    log(`[Baza] Administrator hisobi tayyor: ${adminEmail}`);
  }

  const studentEmail = 'student@eduhub.com';
  const existingStudent = await User.findOne({ email: studentEmail });
  if (!existingStudent) {
    const hashedStudentPassword = await bcrypt.hash('Student123!', 12);
    await User.create({
      email: studentEmail,
      password: hashedStudentPassword,
      role: 'user',
      isVerified: true,
    });
    log('[Baza] Sinov foydalanuvchisi yaratildi: student@eduhub.com (parol: Student123!)');
  }

  // Eski inglizcha namuna kurslarni avtomatik o‘zbek tiliga yangilash
  for (let i = 0; i < OLD_ENGLISH_TITLES.length; i += 1) {
    const oldTitle = OLD_ENGLISH_TITLES[i];
    const uzCourse = SAMPLE_COURSES[i];
    await Course.updateOne({ title: oldTitle }, { $set: uzCourse });
  }

  const existingCourseCount = await Course.countDocuments();
  if (existingCourseCount === 0) {
    const coursesWithAuthor = SAMPLE_COURSES.map((course) => ({
      ...course,
      createdBy: adminUser._id,
    }));
    await Course.insertMany(coursesWithAuthor);
    log(`[Baza] ${coursesWithAuthor.length} ta o‘zbek tilidagi kurs bazaga qo‘shildi.`);
  } else {
    log(`[Baza] Kurslar bo‘limida ${existingCourseCount} ta kurs mavjud.`);
  }
};

module.exports = { seedInitialData };
