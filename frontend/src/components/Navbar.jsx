'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const roleLabel = isAdmin ? 'Administrator' : 'Foydalanuvchi';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.info('Tizimdan xavfsiz chiqdingiz.', 'Chiqish');
      router.push('/');
    } catch {
      toast.error('Chiqishda muammo yuz berdi, mahalliy sessiya tozalandi.');
      router.push('/');
    } finally {
      setLoggingOut(false);
      setMobileMenuOpen(false);
    }
  };

  const linkClass = (href) => {
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return `inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brend */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold leading-none tracking-tight text-slate-900">
              Edu<span className="text-indigo-600">Hub</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Ta’lim platformasi
            </span>
          </div>
        </Link>

        {/* Asosiy navigatsiya */}
        <nav className="hidden items-center gap-1.5 md:flex">
          <Link href="/" className={linkClass('/')}>
            <BookOpen className="h-4 w-4" />
            Kurslar
          </Link>

          {isAuthenticated && (
            <Link href="/profile" className={linkClass('/profile')}>
              <UserIcon className="h-4 w-4" />
              Profil
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link href="/admin/dashboard" className={linkClass('/admin/dashboard')}>
              <LayoutDashboard className="h-4 w-4" />
              Boshqaruv paneli
            </Link>
          )}
        </nav>

        {/* O‘ng tomon tugmalari */}
        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="btn-secondary">
                <LogIn className="h-4 w-4" />
                Kirish
              </Link>
              <Link href="/register" className="btn-primary">
                <UserPlus className="h-4 w-4" />
                Ro‘yxatdan o‘tish
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 py-1 pl-3 pr-2">
                <span className="max-w-[160px] truncate text-xs font-medium text-slate-600">
                  {user?.email}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    isAdmin
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isAdmin && <ShieldCheck className="h-3 w-3" />}
                  {roleLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn-secondary !px-3 !py-2 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="h-4 w-4" />
                <span>{loggingOut ? 'Chiqilmoqda...' : 'Chiqish'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobil menyu tugmasi */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Menyuni ochish"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobil menyu */}
      {mobileMenuOpen && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden">
          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              className={linkClass('/')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-4 w-4" />
              Kurslar
            </Link>

            {isAuthenticated && (
              <Link
                href="/profile"
                className={linkClass('/profile')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="h-4 w-4" />
                Profil
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                href="/admin/dashboard"
                className={linkClass('/admin/dashboard')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Boshqaruv paneli
              </Link>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  className="btn-secondary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="h-4 w-4" />
                  Ro‘yxatdan o‘tish
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="truncate text-xs font-medium text-slate-700">
                    {user?.email}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      isAdmin
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn-secondary w-full text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
