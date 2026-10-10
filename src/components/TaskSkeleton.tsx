"use client";

import React from "react";
import { ViewMode } from "@/store/usePreferencesStore";

export default function TaskSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "table") {
    return (
      <div className="bg-white dark:bg-[#0d1424] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4 shadow-sm">
        <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-28" />
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-24 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  const laneBgs = [
    "bg-[#fff1f4] dark:bg-[#201017]",
    "bg-[#fef9ee] dark:bg-[#20180e]",
    "bg-[#f0f9ff] dark:bg-[#0c1828]",
    "bg-[#f5f3ff] dark:bg-[#18112b]",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, colIndex) => (
        <div
          key={colIndex}
          className={`rounded-3xl p-3.5 border border-slate-200/60 dark:border-slate-800/80 min-h-[580px] animate-pulse space-y-3 ${
            laneBgs[colIndex % laneBgs.length]
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <div className="h-5 bg-white/80 dark:bg-slate-800 rounded-full w-24" />
            <div className="h-5 bg-white/80 dark:bg-slate-800 rounded-full w-8" />
          </div>

          {[...Array(3)].map((_, cardIndex) => (
            <div
              key={cardIndex}
              className="bg-white dark:bg-[#162032] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/90 space-y-3 shadow-xs"
            >
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
              <div className="pt-2 flex justify-between items-center">
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-5" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
