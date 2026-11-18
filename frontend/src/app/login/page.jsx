'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function LoginContent() {
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const prefilledEmail = searchParams.get('email') || '';
  const redirectParam = searchParams.get('redirect') || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectParam || '/profile');
    }
  }, [isAuthenticated, router, redirectParam]);

  useEffect(() => {
    if (!rateLimitInfo || rateLimitInfo.secondsLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setRateLimitInfo((prev) => {
        if (!prev || prev.secondsLeft <= 1) return null;
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Iltimos, elektron pochta va parolni kiriting.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await login({ email: normalizedEmail, password });
      setRateLimitInfo(null);
      toast.success(`Xush kelibsiz, ${data.user.email}!`, 'Tizimga kirildi');

      const redirectPath =
        redirectParam ||
        (data.user.role === 'admin' ? '/admin/dashboard' : '/profile');
      router.replace(redirectPath);
    } catch (err) {
      const status = err.response?.status;
      const payload = err.response?.data;

      if (status === 429) {
        const retrySeconds = Number(payload?.retryAfterSeconds) || 60;
        const rateLimitMsg =
          payload?.message ||
          'Juda ko‘p kirish urinishi qilindi. 1 daqiqada ko‘pi bilan 5 ta so‘rovga ruxsat beriladi.';
        setRateLimitInfo({
          message: rateLimitMsg,
          secondsLeft: retrySeconds,
        });
        toast.warning(rateLimitMsg, 'So‘rovlar limiti to‘ldi (429)');
      } else if (status === 403 && payload?.requiresVerification) {
        setError(payload.message);
        setUnverifiedEmail(payload.email || normalizedEmail);
      } else {
        const message =
          payload?.message || 'Tizimga kirib bo‘lmadi. Ma’lumotlarni tekshirib qayta urining.';
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-9">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              EduHub tizimiga kirish
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              O‘qishni davom ettirish uchun tasdiqlangan hisobingizga kiring.
            </p>
          </div>

          {/* 429 limit ogohlantirishi */}
          {rateLimitInfo && (
            <div
              role="alert"
              className="animate-slide-in mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-amber-950">
                      429 — So‘rovlar cheklovi faollashdi
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-950">
                      <Clock className="h-3 w-3" />
                      {rateLimitInfo.secondsLeft} soniya
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900">
                    {rateLimitInfo.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Xatolik xabari */}
          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div className="flex-1">
                  <p>{error}</p>
                  {unverifiedEmail && (
                    <Link
                      href={`/verify?email=${encodeURIComponent(unverifiedEmail)}`}
                      className="mt-2 inline-flex font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-800"
                    >
                      {unverifiedEmail} manzilini hozir tasdiqlash &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Elektron pochta
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduhub.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Parol
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolingizni kiriting"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-2 w-full py-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tekshirilmoqda...
                </>
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          {/* Tayyor sinov hisoblari */}
          <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/90 p-3.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Tayyor sinov hisoblari</p>
            <div className="mt-1.5 space-y-1 font-mono text-[11px]">
              <p>
                <span className="font-semibold text-indigo-700">Administrator:</span>{' '}
                admin@eduhub.com / Admin123!
              </p>
              <p>
                <span className="font-semibold text-emerald-700">Foydalanuvchi:</span>{' '}
                student@eduhub.com / Student123!
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Hisobingiz yo‘qmi?{' '}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Ro‘yxatdan o‘tish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
