'use client';

import { useEffect, useState } from 'react';
import { BookPlus, Edit3, Loader2, X } from 'lucide-react';

const PRESET_CATEGORIES = [
  'Dasturlash',
  'Sun’iy intellekt',
  'Dizayn',
  'Kiberxavfsizlik',
  'Bulut texnologiyalari',
  'Ma’lumotlar tahlili',
  'Biznes va mahsulot',
];

const INITIAL_FORM = {
  title: '',
  description: '',
  instructor: '',
  price: '',
  category: 'Dasturlash',
};

export default function CourseModal({ isOpen, onClose, onSubmit, course, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  const isEditing = Boolean(course);

  useEffect(() => {
    if (isOpen) {
      if (course) {
        setForm({
          title: course.title || '',
          description: course.description || '',
          instructor: course.instructor || '',
          price: course.price !== undefined ? String(course.price) : '',
          category: course.category || 'Dasturlash',
        });
      } else {
        setForm(INITIAL_FORM);
      }
      setError('');
    }
  }, [isOpen, course]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.instructor.trim() ||
      form.price === '' ||
      !form.category.trim()
    ) {
      setError('Iltimos, barcha majburiy maydonlarni to‘ldiring.');
      return;
    }

    const numericPrice = Number(form.price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setError('Narx manfiy bo‘lmagan to‘g‘ri raqam bo‘lishi kerak.');
      return;
    }

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      instructor: form.instructor.trim(),
      price: numericPrice,
      category: form.category.trim(),
    });
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
    >
      <div className="animate-slide-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Sarlavha */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              {isEditing ? <Edit3 className="h-5 w-5" /> : <BookPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 id="course-modal-title" className="text-lg font-bold text-slate-900">
                {isEditing ? 'Kursni tahrirlash' : 'Yangi kurs qo‘shish'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Kurs ma’lumotlarini yangilang va o‘zgarishlarni darhol saqlang.'
                  : 'Ommaviy EduHub katalogiga yangi kurs qo‘shing.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
            aria-label="Oynani yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="course-title" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Kurs nomi
            </label>
            <input
              id="course-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Masalan: Node.js va Next.js bilan veb-dasturlash"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="course-instructor" className="mb-1.5 block text-sm font-semibold text-slate-700">
                O‘qituvchi ismi
              </label>
              <input
                id="course-instructor"
                name="instructor"
                type="text"
                value={form.instructor}
                onChange={handleChange}
                placeholder="Masalan: Azizbek Karimov"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="course-price" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Narxi (AQSh dollarida)
              </label>
              <input
                id="course-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="129"
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="course-category" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Yo‘nalish
            </label>
            <input
              id="course-category"
              name="category"
              type="text"
              list="eduhub-course-categories"
              value={form.category}
              onChange={handleChange}
              placeholder="Yo‘nalishni tanlang yoki yozing"
              className="input-field"
              required
            />
            <datalist id="eduhub-course-categories">
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="course-description" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Kurs tavsifi
            </label>
            <textarea
              id="course-description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Kursda o‘rganiladigan asosiy ko‘nikmalar, mavzular va kutilayotgan natijalarni yozing..."
              className="input-field resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Bekor qilish
            </button>
            <button type="submit" disabled={submitting} className="btn-primary min-w-[150px]">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Saqlanmoqda...' : 'Joylanmoqda...'}
                </>
              ) : isEditing ? (
                'O‘zgarishlarni saqlash'
              ) : (
                'Kursni joylash'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
