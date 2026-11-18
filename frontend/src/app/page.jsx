'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import api from '@/api/axios';
import CourseCard from '@/components/CourseCard';
import { useAuth } from '@/context/AuthContext';

export default function CoursesPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/courses');
      setCourses(data.courses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Hozirda kurslarni yuklab bo‘lmadi. Backend server 5000-portda ishlayotganini tekshiring.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
    return ['Barchasi', ...unique.sort()];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'Barchasi' || course.category === selectedCategory;

      if (!normalizedQuery) return matchesCategory;

      const haystack = `${course.title} ${course.description} ${course.instructor} ${course.category}`.toLowerCase();
      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [courses, searchQuery, selectedCategory]);

  return (
    <div className="pb-20">
      {/* Asosiy banner */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 25%, rgba(99, 102, 241, 0.6) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.45) 0%, transparent 45%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              Zamonaviy kasblar va amaliy ta’lim
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.12]">
              Dasturlash, sun’iy intellekt va dizaynni{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                EduHub
              </span>{' '}
              bilan o‘rganing
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Tajribali mutaxassislar tomonidan tayyorlangan eng dolzarb kurslarni ko‘rib chiqing. Istalgan vaqtda bepul tanishib chiqing yoki shaxsiy profilingizga kiring.
            </p>

            {/* Tezkor tugma va statistika */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {!isAuthenticated ? (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-400 active:scale-[0.98]"
                >
                  Bepul hisob yaratish
                </Link>
              ) : isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-400 active:scale-[0.98]"
                >
                  Boshqaruv panelini ochish
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-400 active:scale-[0.98]"
                >
                  Mening profilimga o‘tish
                </Link>
              )}

              <div className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-200 backdrop-blur-md">
                <span className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="h-4 w-4 text-indigo-300" />
                  <strong className="text-white">{courses.length}</strong> ta kurs
                </span>
                <span className="h-4 w-px bg-white/15" />
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="h-4 w-4 text-sky-300" />
                  <strong className="text-white">
                    {Math.max(0, categories.length - 1)}
                  </strong>{' '}
                  ta yo‘nalish
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qidiruv va yo‘nalish filtrlari */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card -mt-8 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kurs nomi, o‘qituvchi yoki kalit so‘z bo‘yicha qidiring..."
                className="input-field pl-10 pr-9"
                aria-label="Kurslarni qidirish"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Qidiruvni tozalash"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Natijalar soni */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {selectedCategory === 'Barchasi' ? 'Barcha kurslar' : selectedCategory}
            </h2>
            <p className="text-sm text-slate-500">
              Jami {courses.length} ta kursdan {filteredCourses.length} tasi ko‘rsatilmoqda
            </p>
          </div>
        </div>

        {/* Xatolik holati */}
        {error && (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/90 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="text-sm font-semibold text-rose-900">
                  Kurslar katalogini yuklab bo‘lmadi
                </p>
                <p className="mt-0.5 text-sm text-rose-700">{error}</p>
              </div>
            </div>
            <button type="button" onClick={fetchCourses} className="btn-secondary shrink-0">
              <RefreshCw className="h-4 w-4" />
              Qayta urinish
            </button>
          </div>
        )}

        {/* Yuklanish holati */}
        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="glass-card animate-pulse overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-28 rounded-full bg-slate-200" />
                  <div className="h-7 w-16 rounded-xl bg-slate-200" />
                </div>
                <div className="mt-5 h-6 w-4/5 rounded-lg bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-5/6 rounded bg-slate-100" />
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                  <div className="h-4 w-32 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bo‘sh holat */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="glass-card mt-8 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Mos kurslar topilmadi</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              {courses.length === 0
                ? 'Hozircha birorta ham kurs joylanmagan. Boshqaruv paneli orqali yangi kurs qo‘shing.'
                : 'Qidiruv so‘zini o‘zgartirib ko‘ring yoki boshqa yo‘nalishni tanlang.'}
            </p>
            {(searchQuery || selectedCategory !== 'Barchasi') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Barchasi');
                }}
                className="btn-secondary mt-5"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        )}

        {/* Kurslar ro‘yxati */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
