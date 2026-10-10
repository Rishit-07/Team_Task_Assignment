"use client";

import React, { useEffect } from "react";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { AlertCircle, CheckCircle2, RotateCcw, X } from "lucide-react";

export default function ToastNotification() {
  const toast = usePreferencesStore((state) => state.toast);
  const dismissToast = usePreferencesStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isRollback = toast.type === "rollback";
  const isError = toast.type === "error";
  const isSuccess = toast.type === "success";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${
          isRollback
            ? "bg-amber-950/90 border-amber-600/60 text-amber-100"
            : isError
            ? "bg-red-950/90 border-red-600/60 text-red-100"
            : isSuccess
            ? "bg-emerald-950/90 border-emerald-600/60 text-emerald-100"
            : "bg-slate-900/90 border-slate-700 text-slate-100"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isRollback ? (
            <RotateCcw className="w-5 h-5 text-amber-400 animate-spin-once" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm flex items-center justify-between">
            <span>{toast.title}</span>
          </div>
          <p className="text-xs mt-1 text-slate-200/90 leading-relaxed break-words">
            {toast.description}
          </p>
        </div>

        <button
          onClick={dismissToast}
          aria-label="Close notification"
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
