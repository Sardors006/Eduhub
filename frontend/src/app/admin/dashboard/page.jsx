'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import api from '@/api/axios';
import AdminRoute from '@/components/AdminRoute';
import CourseModal from '@/components/CourseModal';
import { useToast } from '@/context/ToastContext';

function AdminDashboardContent() {
  const { toast } = useToast();

  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalCourses: 0,
    recentCourses: [],
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);

  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const loadDashboardData = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [dashboardRes, coursesRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/courses'),
        ]);

        const stats = dashboardRes.data.analytics || dashboardRes.data;
        setAnalytics({
          totalUsers: stats.totalUsers ?? 0,
          verifiedUsers: stats.verifiedUsers ?? 0,
          totalCourses: stats.totalCourses ?? 0,
          recentCourses: stats.recentCourses ?? [],
        });
        setCourses(coursesRes.data.courses || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message || 'Boshqaruv paneli ma’lumotlarini yuklab bo‘lmadi.',
          'Yuklashda xatolik'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  const verificationRate = useMemo(() => {
    if (!analytics.totalUsers) return 0;
    return Math.round((analytics.verifiedUsers / analytics.totalUsers) * 100);
  }, [analytics.totalUsers, analytics.verifiedUsers]);

  const filteredCourses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      `${c.title} ${c.instructor} ${c.category} ${c.description}`
        .toLowerCase()
        .includes(q)
    );
  }, [courses, searchTerm]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleSaveCourse = async (formData) => {
    setSavingCourse(true);
    try {
      if (editingCourse) {
        const { data } = await api.put(`/courses/${editingCourse._id}`, formData);
        const updated = data.course;
        setCourses((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item))
        );
        setAnalytics((prev) => ({
          ...prev,
          recentCourses: prev.recentCourses.map((item) =>
            item._id === updated._id ? updated : item
          ),
        }));
        toast.success(`"${updated.title}" kursi muvaffaqiyatli yangilandi.`, 'Kurs yangilandi');
      } else {
        const { data } = await api.post('/courses', formData);
        const created = data.course;
        setCourses((prev) => [created, ...prev]);
        setAnalytics((prev) => ({
          ...prev,
          totalCourses: prev.totalCourses + 1,
          recentCourses: [created, ...prev.recentCourses].slice(0, 5),
        }));
        toast.success(`"${created.title}" kursi katalogga qo‘shildi.`, 'Yangi kurs yaratildi');
      }

      setModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Kurs o‘zgarishlarini saqlab bo‘lmadi.',
        'Saqlashda xatolik'
      );
    } finally {
      setSavingCourse(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    setDeletingBusy(true);
    try {
      await api.delete(`/courses/${deletingCourse._id}`);
      const removedId = deletingCourse._id;
      const removedTitle = deletingCourse.title;

      setCourses((prev) => prev.filter((item) => item._id !== removedId));
      setAnalytics((prev) => ({
        ...prev,
        totalCourses: Math.max(0, prev.totalCourses - 1),
        recentCourses: prev.recentCourses.filter((item) => item._id !== removedId),
      }));

      toast.info(`"${removedTitle}" kursi butunlay o‘chirildi.`, 'Kurs o‘chirildi');
      setDeletingCourse(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Kursni o‘chirib bo‘lmadi.',
        'O‘chirishda xatolik'
      );
    } finally {
      setDeletingBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">
          Statistika va kurslar studiyasi yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Sahifa sarlavhasi */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Administrator markazi
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Platforma tahlili va kurslar boshqaruvi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Foydalanuvchilar ko‘rsatkichlarini kuzating va ommaviy kurslar katalogini boshqaring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yangilash
          </button>
          <button type="button" onClick={openCreateModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            Yangi kurs
          </button>
        </div>
      </div>

      {/* Ko‘rsatkich kartalari */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Jami foydalanuvchilar
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {analytics.totalUsers}
          </p>
          <p className="mt-1 text-xs text-slate-500">Ro‘yxatdan o‘tgan barcha hisoblar</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tasdiqlanganlar
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BadgeCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {analytics.verifiedUsers}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-700">
            Pochtasi tasdiqlangan hisoblar
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tasdiqlash darajasi
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {verificationRate}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500"
              style={{ width: `${verificationRate}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Jami kurslar
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {analytics.totalCourses}
          </p>
          <p className="mt-1 text-xs text-slate-500">Katalogda e’lon qilingan kurslar</p>
        </div>
      </div>

      {/* So‘nggi qo‘shilgan kurslar */}
      {analytics.recentCourses.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            So‘nggi qo‘shilgan kurslar
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {analytics.recentCourses.map((rc) => (
              <div
                key={rc._id}
                className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-md"
              >
                <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  {rc.category}
                </span>
                <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-900">
                  {rc.title}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{rc.instructor}</span>
                  <span className="font-bold text-slate-800">{rc.price} $</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kurslarni boshqarish studiyasi */}
      <section className="glass-card mt-8 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Kurslarni boshqarish bo‘limi
            </h2>
            <p className="text-xs text-slate-500">
              Kurslarni yarating, tahrirlang yoki o‘chiring — barcha o‘zgarishlar darhol katalogda aks etadi.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kurslarni saralash..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Jadval */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5">Kurs</th>
                <th className="px-6 py-3.5">Yo‘nalish</th>
                <th className="px-6 py-3.5">O‘qituvchi</th>
                <th className="px-6 py-3.5">Narxi</th>
                <th className="px-6 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {courses.length === 0
                      ? 'Hali birorta ham kurs yaratilmagan. Birinchi kursni qo‘shish uchun "Yangi kurs" tugmasini bosing.'
                      : 'Qidiruv bo‘yicha mos kurs topilmadi.'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr
                    key={course._id}
                    className="transition-colors hover:bg-indigo-50/30"
                  >
                    <td className="max-w-sm px-6 py-4">
                      <p className="font-semibold text-slate-900">{course.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {course.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full border border-indigo-200/70 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {course.instructor}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {Number(course.price) === 0
                        ? 'Bepul'
                        : `${Number(course.price).toFixed(
                            Number(course.price) % 1 === 0 ? 0 : 2
                          )} $`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(course)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Tahrirlash
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCourse(course)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          O‘chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Kurs yaratish / tahrirlash oynasi */}
      <CourseModal
        isOpen={modalOpen}
        onClose={() => {
          if (!savingCourse) {
            setModalOpen(false);
            setEditingCourse(null);
          }
        }}
        onSubmit={handleSaveCourse}
        course={editingCourse}
        submitting={savingCourse}
      />

      {/* O‘chirishni tasdiqlash oynasi */}
      {deletingCourse && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-slide-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kursni o‘chirish</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  <strong className="text-slate-900">{deletingCourse.title}</strong> kursini butunlay o‘chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                disabled={deletingBusy}
                className="btn-secondary"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingBusy}
                className="btn-danger"
              >
                {deletingBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    O‘chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Kursni o‘chirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}
