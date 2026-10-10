"use client";

import React from "react";
import { ViewMode } from "@/store/usePreferencesStore";

export default function TaskSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "table") {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-pulse space-y-4 shadow-sm">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-28" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {[...Array(5)].map((_, colIndex) => (
        <div
          key={colIndex}
          className="rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 p-3 min-h-[450px] animate-pulse space-y-3"
        >
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3" />
          {[...Array(3)].map((_, cardIndex) => (
            <div
              key={cardIndex}
              className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-2.5"
            >
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
              <div className="pt-2 flex justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-5" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-14" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
