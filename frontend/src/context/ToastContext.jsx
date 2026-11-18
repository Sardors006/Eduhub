'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4500 }) => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (message, title = 'Muvaffaqiyat') =>
        addToast({ type: 'success', title, message }),
      error: (message, title = 'Xatolik') =>
        addToast({ type: 'error', title, message, duration: 5500 }),
      warning: (message, title = 'Ogohlantirish') =>
        addToast({ type: 'warning', title, message, duration: 5500 }),
      info: (message, title = 'Bildirishnoma') =>
        addToast({ type: 'info', title, message }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast faqat ToastProvider ichida ishlatilishi kerak');
  }
  return context;
};
