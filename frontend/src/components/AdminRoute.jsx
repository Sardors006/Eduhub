'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [initializing, isAuthenticated, router, pathname]);

  if (initializing || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">
          Administrator huquqi tekshirilmoqda...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="glass-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
            403 — Ruxsat taqiqlangan
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Administrator huquqi talab qilinadi
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Sizning hisobingizda ushbu boshqaruv panelini ko‘rish yoki platforma kurslarini tahrirlash uchun administrator vakolati yo‘q.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-primary">
              <ArrowLeft className="h-4 w-4" />
              Kurslarga qaytish
            </Link>
            <Link href="/profile" className="btn-secondary">
              Profilni ko‘rish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
