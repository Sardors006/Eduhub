import { BookOpen, Sparkles, User } from 'lucide-react';

const CATEGORY_GRADIENTS = {
  Dasturlash: 'from-indigo-500 to-blue-600',
  'Sun’iy intellekt': 'from-violet-600 to-fuchsia-600',
  Dizayn: 'from-pink-500 to-rose-500',
  Kiberxavfsizlik: 'from-slate-700 to-indigo-800',
  'Bulut texnologiyalari': 'from-sky-500 to-cyan-600',
  'Ma’lumotlar tahlili': 'from-emerald-500 to-teal-600',
};

const CATEGORY_BADGES = {
  Dasturlash: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  'Sun’iy intellekt': 'bg-violet-50 text-violet-700 border-violet-200/70',
  Dizayn: 'bg-rose-50 text-rose-700 border-rose-200/70',
  Kiberxavfsizlik: 'bg-slate-100 text-slate-700 border-slate-200',
  'Bulut texnologiyalari': 'bg-sky-50 text-sky-700 border-sky-200/70',
  'Ma’lumotlar tahlili': 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
};

export default function CourseCard({ course }) {
  const gradient =
    CATEGORY_GRADIENTS[course.category] || 'from-indigo-600 to-violet-600';
  const badgeStyle =
    CATEGORY_BADGES[course.category] ||
    'bg-indigo-50 text-indigo-700 border-indigo-200/70';

  const formattedPrice =
    Number(course.price) === 0
      ? 'Bepul'
      : `${Number(course.price).toFixed(Number(course.price) % 1 === 0 ? 0 : 2)} $`;

  return (
    <article className="glass-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-glass-hover">
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}
          >
            <Sparkles className="h-3 w-3" />
            {course.category}
          </span>

          <div className="shrink-0 rounded-xl bg-slate-900 px-3 py-1 text-sm font-bold text-white shadow-sm">
            {formattedPrice}
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600">
          {course.title}
        </h3>

        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
          {course.description}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                O‘qituvchi
              </p>
              <p className="truncate text-sm font-semibold text-slate-800">
                {course.instructor}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
            Kurs
          </span>
        </div>
      </div>
    </article>
  );
}
