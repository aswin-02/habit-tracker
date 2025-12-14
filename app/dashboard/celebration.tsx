"use client";

import { useEffect } from "react";

export default function Celebration({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative max-w-lg w-[90%] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Well done!</div>
        <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6">{message}</div>

        <div className="flex justify-center">
          <button
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold shadow hover:scale-[1.02] transition-transform"
            onClick={onClose}
          >
            Nice!
          </button>
        </div>
      </div>
    </div>
  );
}
