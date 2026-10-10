"use client";

import React, { useState } from "react";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import {
  Activity,
  AlertTriangle,
  Clock,
  Moon,
  RefreshCw,
  Sun,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SimulationControl() {
  const {
    theme,
    toggleTheme,
    failMutations,
    setFailMutations,
    latencyMs,
    setLatencyMs,
    showToast,
  } = usePreferencesStore();

  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        showToast({
          title: "Database Reset",
          description: "All 105 seeded tasks have been restored.",
          type: "success",
        });
      }
    } catch {
      showToast({
        title: "Reset Failed",
        description: "Could not reset mock store.",
        type: "error",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl shadow-sm">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400" />
        <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
          Chaos & Resilience Controls
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Mutation failure simulation toggle */}
        <label
          htmlFor="fail-mutations-toggle"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                failMutations ? "text-amber-400" : "text-slate-500"
              }`}
            />
            <span className={failMutations ? "text-amber-300 font-semibold" : "text-slate-400"}>
              Simulate API Failures
            </span>
          </span>
          <div className="relative inline-flex items-center">
            <input
              id="fail-mutations-toggle"
              type="checkbox"
              checked={failMutations}
              onChange={(e) => {
                setFailMutations(e.target.checked);
                showToast({
                  title: e.target.checked
                    ? "Failure Simulation Active"
                    : "Failure Simulation Disabled",
                  description: e.target.checked
                    ? "Next status change or task edit will simulate a 500 error to verify rollback."
                    : "Mutations will now succeed normally.",
                  type: e.target.checked ? "rollback" : "info",
                });
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </div>
        </label>

        {/* Latency control */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Delay:</span>
          <select
            value={latencyMs}
            onChange={(e) => setLatencyMs(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value={0}>0ms (Instant)</option>
            <option value={300}>300ms (Realistic)</option>
            <option value={800}>800ms (High latency)</option>
            <option value={1500}>1500ms (Slow 3G)</option>
          </select>
        </div>

        {/* Reset mock database button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Restore 105 synthetic tasks"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>Reset 105 Tasks</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle visual theme"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
