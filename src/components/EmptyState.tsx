"use client";

import React from "react";
import { FolderSearch, Plus, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  onClearFilters: () => void;
  onOpenCreateModal: () => void;
}

export default function EmptyState({
  onClearFilters,
  onOpenCreateModal,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 mb-4 ring-8 ring-slate-50 dark:ring-slate-900/50">
        <FolderSearch className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        No matching tasks discovered
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        None of the tasks match your active search terms or filtered parameters. Try resetting your query or creating a new item.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all shadow-sm shadow-indigo-600/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
}
