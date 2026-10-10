"use client";

import React from "react";
import { AlertOctagon, RotateCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 rounded-2xl shadow-sm">
      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-full text-rose-500 mb-4 ring-8 ring-rose-50/50 dark:ring-rose-950/20">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        Failed to load tasks
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {message || "An unexpected error interrupted data synchronization. Check network or simulation settings."}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-xl transition-all shadow-sm"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>Retry Query</span>
      </button>
    </div>
  );
}
