"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAssignees, useTasks } from "@/hooks/useTasks";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { TaskFilterParams, TaskPriority, TaskStatus } from "@/types/task";
import SimulationControl from "./SimulationControl";
import FilterBar from "./FilterBar";
import KanbanBoard from "./KanbanBoard";
import TaskTable from "./TaskTable";
import CreateTaskModal from "./CreateTaskModal";
import ToastNotification from "./ToastNotification";
import TaskSkeleton from "./TaskSkeleton";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import {
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function DashboardView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { theme, viewMode } = usePreferencesStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sync theme class to html tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Read filter parameters from URL
  const filters: TaskFilterParams = {
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as TaskStatus | "all") || "all",
    priority: (searchParams.get("priority") as TaskPriority | "all") || "all",
    assigneeId: searchParams.get("assigneeId") || "all",
    sortBy:
      (searchParams.get("sortBy") as
        | "title"
        | "dueDate"
        | "priority"
        | "createdAt"
        | "status") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
    limit:
      viewMode === "kanban"
        ? 105 // For Kanban board, fetch all filtered items so lanes have complete data
        : searchParams.has("limit")
        ? Number(searchParams.get("limit"))
        : 20,
  };

  const {
    data: tasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTasks(filters);
  const { data: assignees = [] } = useAssignees();

  const handleClearFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const total = tasksData?.total ?? 0;
  const inProgressCount = tasksData?.countsByStatus?.in_progress ?? 0;
  const inReviewCount = tasksData?.countsByStatus?.in_review ?? 0;
  const doneCount = tasksData?.countsByStatus?.done ?? 0;

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Chaos Simulation & Preference Bar */}
        <SimulationControl />

        {/* Hero Section */}
        <section className="pt-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Distributed Engineering Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white max-w-4xl">
                Sprint Objectives & Task Progression
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                High-concurrency task orchestration with optimistic local mutation, automated snapshot rollback, and cross-view cache parity.
              </p>
            </div>

            {/* Quick Metrics Bento Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 self-stretch md:self-auto shrink-0">
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Total Tracked
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {total}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
                <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium block">
                  In Progress
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {inProgressCount}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
                <span className="text-[11px] text-amber-500 dark:text-amber-400 font-medium block">
                  In Review
                </span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {inReviewCount}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
                <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-medium block">
                  Completed
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {doneCount}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Filter and Controls Bar */}
        <section>
          <FilterBar
            assignees={assignees}
            totalTasks={total}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        </section>

        {/* Main Work Area: Kanban or Table */}
        <section className="pt-2">
          {isLoading ? (
            <TaskSkeleton viewMode={viewMode} />
          ) : isError ? (
            <ErrorState
              message={
                error instanceof Error ? error.message : "Failed to load tasks."
              }
              onRetry={() => refetch()}
            />
          ) : !tasksData || tasksData.items.length === 0 ? (
            <EmptyState
              onClearFilters={handleClearFilters}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          ) : viewMode === "kanban" ? (
            <KanbanBoard tasks={tasksData.items} />
          ) : (
            <TaskTable data={tasksData} assignees={assignees} />
          )}
        </section>

        {/* Global Modal and Toast Feedback */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          assignees={assignees}
        />
        <ToastNotification />
      </div>
    </main>
  );
}
