import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'gold';
  icon?: string;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const colors = {
    success: 'bg-emerald-600 border-emerald-800',
    error: 'bg-red-600 border-red-800',
    info: 'bg-violet-600 border-violet-800',
    gold: 'bg-amber-500 border-amber-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.8 }}
      transition={{ duration: 0.25 }}
      className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl border-b-4 shadow-xl text-white font-mono font-black text-xs max-w-[260px] ${colors[toast.type]}`}
    >
      {toast.icon && <span className="text-base shrink-0">{toast.icon}</span>}
      <span className="leading-tight">{toast.message}</span>
    </motion.div>
  );
};
