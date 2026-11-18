'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MailCheck,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const OTP_LENGTH = 6;

function VerifyContent() {
  const { verifyEmail, resendCode } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      inputRefs.current[0]?.focus();
    }
  }, [initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index, rawValue) => {
    const cleanValue = rawValue.replace(/\D/g, '');
    if (!cleanValue) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    if (cleanValue.length > 1) {
      const next = [...digits];
      for (let i = 0; i < cleanValue.length && index + i < OTP_LENGTH; i += 1) {
        next[index + i] = cleanValue[i];
      }
      setDigits(next);
      const focusIdx = Math.min(index + cleanValue.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      setError('');
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      next[index] = cleanValue;
      return next;
    });
    setError('');

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i];
    }
    setDigits(next);
    setError('');
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const code = digits.join('');

    if (!normalizedEmail) {
      setError('Ro‘yxatdan o‘tgan elektron pochta manzilingizni kiriting.');
      return;
    }

    if (code.length !== OTP_LENGTH) {
      setError('Iltimos, 6 xonali tasdiqlash kodining barcha raqamlarini kiriting.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyEmail({ email: normalizedEmail, code });
      setVerified(true);
      toast.success(
        result.message || 'Elektron pochta tasdiqlandi! Kirish sahifasiga yo‘naltirilmoqda...',
        'Hisob tasdiqlandi'
      );
      setTimeout(() => {
        router.replace(`/login?email=${encodeURIComponent(normalizedEmail)}`);
      }, 1400);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Tasdiqlash amalga oshmadi. Kodni tekshiring.';
      setError(message);
      toast.error(message, 'Tasdiqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Yangi kod so‘rash uchun avval elektron pochta manzilingizni kiriting.');
      return;
    }

    setResending(true);
    setError('');
    try {
      const result = await resendCode(normalizedEmail);
      setDigits(Array(OTP_LENGTH).fill(''));
      setCooldown(30);
      toast.info(
        result.message || 'Yangi 6 xonali tasdiqlash kodi yuborildi.',
        'Kod qayta yuborildi'
      );
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message =
        err.response?.data?.message || 'Kodni qayta yuborib bo‘lmadi.';
      setError(message);
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-9">
          {verified ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
                Pochta tasdiqlandi!
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Hisobingiz faollashtirildi. Kirish sahifasiga yo‘naltirilmoqdasiz...
              </p>
              <Link
                href={`/login?email=${encodeURIComponent(email)}`}
                className="btn-primary mt-6"
              >
                Kirish sahifasiga o‘tish
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-500/25">
                  <MailCheck className="h-6 w-6" />
                </div>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                  Elektron pochtani tasdiqlash
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  {email ? (
                    <>
                      <span className="font-semibold text-slate-800">{email}</span> manziliga yuborilgan 6 xonali kodni kiriting.
                    </>
                  ) : (
                    'Elektron pochtangizga yuborilgan 6 xonali kodni kiriting.'
                  )}
                </p>
              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-3 text-xs text-indigo-800">
                <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <span>
                  <strong>Eslatma:</strong> Lokal rejimda pochta serveri ulanmagan bo‘lsa, 6 xonali kod backend terminal oynasida chiqadi.
                </span>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {!initialEmail && (
                  <div>
                    <label
                      htmlFor="verify-email"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Ro‘yxatdan o‘tgan elektron pochta
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="verify-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sizning@pochta.uz"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2.5 block text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    6 xonali tasdiqlash kodi
                  </label>
                  <div
                    className="grid grid-cols-6 gap-2 sm:gap-2.5"
                    onPaste={handlePaste}
                  >
                    {digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        aria-label={`${index + 1}-raqam`}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white text-center text-xl font-bold text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 sm:h-14"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || digits.join('').length !== OTP_LENGTH}
                  className="btn-primary w-full py-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kod tekshirilmoqda...
                    </>
                  ) : (
                    'Tasdiqlash va hisobni faollashtirish'
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-2 border-t border-slate-100 pt-5 text-center">
                <p className="text-xs text-slate-500">
                  Kod kelmadimi yoki muddati tugadimi?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`}
                  />
                  {cooldown > 0
                    ? `Qayta yuborish: ${cooldown} soniyadan keyin`
                    : resending
                    ? 'Yangi kod yuborilmoqda...'
                    : '6 xonali kodni qayta yuborish'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
