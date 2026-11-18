'use client';

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const STYLE_MAP = {
  success: {
    container: 'border-emerald-200/80 bg-white/95 text-slate-900',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    accent: 'bg-emerald-500',
  },
  error: {
    container: 'border-rose-200/80 bg-white/95 text-slate-900',
    icon: XCircle,
    iconColor: 'text-rose-600',
    accent: 'bg-rose-500',
  },
  warning: {
    container: 'border-amber-200/80 bg-white/95 text-slate-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    accent: 'bg-amber-500',
  },
  info: {
    container: 'border-indigo-200/80 bg-white/95 text-slate-900',
    icon: Info,
    iconColor: 'text-indigo-600',
    accent: 'bg-indigo-500',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
    >
      {toasts.map((item) => {
        const config = STYLE_MAP[item.type] || STYLE_MAP.info;
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className={`animate-slide-in relative overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-xl ${config.container}`}
          >
            <div className={`absolute inset-y-0 left-0 w-1 ${config.accent}`} />
            <div className="flex items-start gap-3 pl-1.5">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
              <div className="min-w-0 flex-1">
                {item.title && (
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                )}
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                  {item.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Bildirishnomani yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
