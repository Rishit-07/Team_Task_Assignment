"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePreferencesStore, ViewMode } from "@/store/usePreferencesStore";
import {
  Assignee,
  TaskFilterParams,
  TaskPriority,
  TaskStatus,
} from "@/types/task";
import {
  Columns3,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Table as TableIcon,
  User as UserIcon,
} from "lucide-react";

interface FilterBarProps {
  assignees: Assignee[];
  totalTasks: number;
  onOpenCreateModal: () => void;
}

export default function FilterBar({
  assignees,
  totalTasks,
  onOpenCreateModal,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const { viewMode, setViewMode } = usePreferencesStore();

  // URL query values
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "all";
  const urlPriority = searchParams.get("priority") || "all";
  const urlAssignee = searchParams.get("assigneeId") || "all";

  // Local debounced search state
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Sync external URL changes to local search input
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Push updated query parameters
  const updateQueryParams = (updates: Partial<TaskFilterParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset pagination to page 1 on filter/search change
    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Debounced search effect
  useEffect(() => {
    if (searchInput === urlSearch) return;

    const timer = setTimeout(() => {
      updateQueryParams({ search: searchInput.trim() });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilters =
    Boolean(urlSearch) ||
    urlStatus !== "all" ||
    urlPriority !== "all" ||
    urlAssignee !== "all";

  const clearAllFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input with debouncing */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks by title, tag, or assignee..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                updateQueryParams({ search: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Switcher and Action Button */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          {/* View Mode Toggle: Kanban vs Table */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Create Task Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Assignee, Priority, Status, Reset */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={urlStatus}
          onChange={(e) =>
            updateQueryParams({ status: e.target.value as TaskStatus | "all" })
          }
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
        >
          <option value="all">Status: All</option>
          <option value="backlog">Status: Backlog</option>
          <option value="todo">Status: Todo</option>
          <option value="in_progress">Status: In Progress</option>
          <option value="in_review">Status: In Review</option>
          <option value="done">Status: Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={urlPriority}
          onChange={(e) =>
            updateQueryParams({
              priority: e.target.value as TaskPriority | "all",
            })
          }
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
        >
          <option value="all">Priority: All</option>
          <option value="urgent">Priority: Urgent</option>
          <option value="high">Priority: High</option>
          <option value="medium">Priority: Medium</option>
          <option value="low">Priority: Low</option>
        </select>

        {/* Assignee Filter */}
        <div className="flex items-center">
          <select
            value={urlAssignee}
            onChange={(e) => updateQueryParams({ assigneeId: e.target.value })}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="all">Assignee: All Team</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.role.split(" ")[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button if any filter is active */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}

        {/* Task Counter */}
        <span className="ml-auto text-slate-500 dark:text-slate-400 text-xs font-medium">
          Showing <strong className="text-slate-800 dark:text-slate-100">{totalTasks}</strong> tasks
        </span>
      </div>
    </div>
  );
}
