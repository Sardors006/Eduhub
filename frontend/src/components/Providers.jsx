'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/ToastContainer';

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500 backdrop-blur-md">
            <p>
              &copy; {new Date().getFullYear()} EduHub ta’lim platformasi. Barcha huquqlar himoyalangan.
            </p>
          </footer>
          <ToastContainer />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}
