'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Cookie,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import api from '@/api/axios';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function ProfileContent() {
  const { accessToken, tokenIssuedAt, refreshAccessToken, isAdmin } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(tokenIssuedAt);

  useEffect(() => {
    setLastRefreshedAt(tokenIssuedAt);
  }, [tokenIssuedAt]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/profile');
        if (mounted) {
          setProfile(data.user);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message || 'Foydalanuvchi profilini yuklab bo‘lmadi.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleManualTokenRefresh = async () => {
    setRefreshingToken(true);
    try {
      const result = await refreshAccessToken();
      setLastRefreshedAt(result.issuedAt);
      setRefreshCount((prev) => prev + 1);
      toast.success(
        'Xavfsiz kuki yordamida yangi 15 daqiqalik kirish tokeni berildi.',
        'Token yangilandi'
      );
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Kirish tokenini yangilab bo‘lmadi.';
      toast.error(msg, 'Yangilashda xatolik');
    } finally {
      setRefreshingToken(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const maskedToken = accessToken
    ? `${accessToken.slice(0, 22)}••••••••••••••••${accessToken.slice(-14)}`
    : 'Xotirada faol token mavjud emas';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Profil yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="glass-card border-rose-200 p-8 text-center">
          <p className="text-base font-semibold text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  const avatarInitial = profile?.email ? profile.email[0].toUpperCase() : 'F';
  const roleLabel = profile?.role === 'admin' ? 'Administrator' : 'Foydalanuvchi';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profil sarlavha kartasi */}
      <div className="glass-card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500" />
        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-3xl font-extrabold text-white shadow-lg">
                {avatarInitial}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                    {profile?.email}
                  </h1>
                  {profile?.isVerified && (
                    <span
                      title="Elektron pochta tasdiqlangan"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Tasdiqlangan
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
                      profile?.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Rol: {roleLabel}
                  </span>
                  <span className="text-xs text-slate-400">Hisob raqami: {profile?.id}</span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <Link href="/admin/dashboard" className="btn-primary self-start sm:self-end">
                <LayoutDashboard className="h-4 w-4" />
                Boshqaruv paneli
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ma’lumotlar va Token yangilash bo‘limi */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="glass-card p-6">
          <h2 className="text-base font-bold text-slate-900">Hisob ma’lumotlari</h2>
          <p className="mt-1 text-xs text-slate-500">
            Himoyalangan profil manzilidan olingan foydalanuvchi ma’lumotlari.
          </p>

          <dl className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                <Mail className="h-4 w-4 text-indigo-500" />
                Elektron pochta
              </dt>
              <dd className="text-sm font-semibold text-slate-900">{profile?.email}</dd>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Foydalanuvchi roli
              </dt>
              <dd>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    profile?.role === 'admin'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {roleLabel}
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Tasdiqlash holati
              </dt>
              <dd className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {profile?.isVerified ? 'Tasdiqlangan hisob' : 'Tasdiqlanmagan'}
              </dd>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                <Calendar className="h-4 w-4 text-indigo-500" />
                Ro‘yxatdan o‘tgan sana
              </dt>
              <dd className="text-sm font-medium text-slate-700">
                {formatDateTime(profile?.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Jonli token yangilash sinovi */}
        <section className="glass-card flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Sessiya va tokenni yangilash
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                <Cookie className="h-3.5 w-3.5" />
                Himoyalangan kuki
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              15 daqiqalik kirish tokeningiz faqat tezkor xotirada saqlanadi. Pastdagi tugmani bosib, 7 kunlik himoyalangan kuki orqali yangi kirish tokenini darhol olishingiz mumkin.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-900 p-4 text-slate-100">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                  Xotiradagi kirish tokeni (15 daqiqa)
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">
                  Faol
                </span>
              </div>
              <p className="mt-2.5 break-all font-mono text-xs text-indigo-200">
                {maskedToken}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  Yangilangan vaqti:
                </span>
                <span className="font-mono font-semibold text-white">
                  {formatDateTime(lastRefreshedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleManualTokenRefresh}
              disabled={refreshingToken}
              className="btn-primary w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshingToken ? 'animate-spin' : ''}`}
              />
              {refreshingToken ? 'Token yangilanmoqda...' : 'Kirish tokenini yangilash'}
            </button>

            {refreshCount > 0 && (
              <span className="text-center text-xs font-medium text-emerald-700 sm:text-right">
                Ushbu sessiyada {refreshCount} marta yangilandi
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
