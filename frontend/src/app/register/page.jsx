'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Elektron pochta va parol kiritilishi shart.');
      return;
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo‘lishi kerak.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parollar bir-biriga mos kelmadi.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({ email: normalizedEmail, password });
      toast.success(
        result.message || '6 xonali tasdiqlash kodi elektron pochtangizga yoki server terminaliga yuborildi.',
        'Tasdiqlash kodi yuborildi'
      );
      const targetEmail = result.email || normalizedEmail;
      router.push(`/verify?email=${encodeURIComponent(targetEmail)}`);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi. Qayta urinib ko‘ring.';
      setError(message);
      toast.error(message, 'Ro‘yxatdan o‘tishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass-card overflow-hidden p-8 sm:p-9">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              EduHub hisobini yaratish
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Elektron pochtangizni tasdiqlab, shaxsiy ta’lim kabinetingizni oching.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Elektron pochta
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sizning@pochta.uz"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Parol
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
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

            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta kiriting"
                  className="input-field pl-10"
                  required
                />
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
                  Hisob yaratilmoqda...
                </>
              ) : (
                <>
                  Tasdiqlash bosqichiga o‘tish
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>
              Parollar shifrlangan holda saqlanadi. 6 xonali tasdiqlash kodi 10 daqiqa amal qiladi.
            </span>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Hisobingiz bormi?{' '}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Tizimga kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
