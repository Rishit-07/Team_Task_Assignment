"use client";

import React, { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAssignees, useTasks } from "@/hooks/useTasks";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import {
  Assignee,
  PaginatedTasksResponse,
  TaskFilterParams,
  TaskPriority,
  TaskStatus,
} from "@/types/task";
import KanbanBoard from "./KanbanBoard";
import TaskTable from "./TaskTable";
import CreateTaskModal from "./CreateTaskModal";
import ToastNotification from "./ToastNotification";
import TaskSkeleton from "./TaskSkeleton";
import ErrorState from "./ErrorState";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Columns3,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Table as TableIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardViewProps {
  initialTasks?: PaginatedTasksResponse;
  initialAssignees?: Assignee[];
}

export default function DashboardView({
  initialTasks,
  initialAssignees = [],
}: DashboardViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const {
    viewMode,
    setViewMode,
    failMutations,
    setFailMutations,
    latencyMs,
    setLatencyMs,
    showToast,
  } = usePreferencesStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Read URL query parameters
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = (searchParams.get("status") as TaskStatus | "all") || "all";
  const urlPriority =
    (searchParams.get("priority") as TaskPriority | "all") || "all";
  const urlAssignee = searchParams.get("assigneeId") || "all";
  const urlSortBy =
    (searchParams.get("sortBy") as
      | "title"
      | "dueDate"
      | "priority"
      | "createdAt"
      | "status") || "createdAt";

  // Build filter object for TanStack Query
  const filters: TaskFilterParams = {
    search: urlSearch || undefined,
    status: urlStatus,
    priority: urlPriority,
    assigneeId: urlAssignee,
    sortBy: urlSortBy,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
    limit: viewMode === "kanban" ? 105 : 20,
  };

  const {
    data: tasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTasks(filters, initialTasks);
  const { data: assignees = initialAssignees } = useAssignees(initialAssignees);

  const [searchInput, setSearchInput] = useState(urlSearch);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        showToast({
          title: "Tasks Reset",
          description: "Restored all 105 seeded tasks.",
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

  // Metrics
  const activeData = tasksData || initialTasks;
  const total = activeData?.total ?? 105;
  const inProgressCount = activeData?.countsByStatus?.in_progress ?? 28;
  const inReviewCount = activeData?.countsByStatus?.in_review ?? 14;
  const doneCount = activeData?.countsByStatus?.done ?? 42;

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-800">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Search */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#0f3d2e] flex items-center justify-center text-white">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                NovaBoard
              </span>
            </div>

            {/* Global Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tasks, commits, assignees..."
                className="w-full pl-10 pr-12 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/70">
                Enter
              </span>
            </form>
          </div>

          {/* Operational Controls: Parity, Latency, Failure Sim, Reset */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Sync Parity</span>
            </div>

            {/* Latency selector */}
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                aria-label="Simulation delay"
                className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value={0}>0ms</option>
                <option value={300}>300ms</option>
                <option value={800}>800ms</option>
              </select>
            </div>

            {/* Simulated API failure toggle */}
            <button
              onClick={() => {
                setFailMutations(!failMutations);
                showToast({
                  title: !failMutations
                    ? "Fault Simulation Enabled"
                    : "Fault Simulation Disabled",
                  description: !failMutations
                    ? "Next mutation will reject with simulated 500 error to test rollback."
                    : "Mutations will now persist normally.",
                  type: !failMutations ? "rollback" : "info",
                });
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border transition-colors ${
                failMutations
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle
                className={`w-3.5 h-3.5 ${
                  failMutations ? "text-amber-600" : "text-slate-400"
                }`}
              />
              <span>Fault Sim: {failMutations ? "On" : "Off"}</span>
            </button>

            {/* Reset 105 tasks */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`}
              />
              <span>Reset 105 Tasks</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Project Title & Team Avatars */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              NovaBoard Mobile & Core Engine
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span>Client: Arcadia Solutions</span>
              <span>•</span>
              <span>Timeline: May 20 – June 30, 2025</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                In Progress
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">
                Sprint 28 Cycle Parity
              </span>
            </div>
          </div>

          {/* Team stack */}
          <div className="flex items-center -space-x-1.5">
            <span className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center ring-2 ring-white">
              AR
            </span>
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center ring-2 ring-white">
              EC
            </span>
            <span className="w-8 h-8 rounded-full bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center ring-2 ring-white">
              MV
            </span>
            <span className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center ring-2 ring-white">
              SJ
            </span>
            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center ring-2 ring-white">
              +5
            </span>
          </div>
        </section>

        {/* View Switcher, Filter & Action Bar */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
          {/* Focused View Toggle: Board vs Table */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-[#dcfce7] text-[#0f3d2e] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Board View</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-[#0f3d2e] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>

          {/* Sort, Filter & Add Task */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <span>Sort by:</span>
              <select
                value={urlSortBy}
                onChange={(e) => updateParam("sortBy", e.target.value)}
                aria-label="Sort tasks by"
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="status">Stage</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 top-10 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Status
                    </label>
                    <select
                      value={urlStatus}
                      onChange={(e) => updateParam("status", e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200"
                    >
                      <option value="all">All</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Priority
                    </label>
                    <select
                      value={urlPriority}
                      onChange={(e) => updateParam("priority", e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200"
                    >
                      <option value="all">All</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Assignee
                    </label>
                    <select
                      value={urlAssignee}
                      onChange={(e) =>
                        updateParam("assigneeId", e.target.value)
                      }
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200"
                    >
                      <option value="all">All Team</option>
                      {assignees.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0f3d2e] hover:bg-[#0c3527] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Task</span>
            </button>
          </div>
        </section>

        {/* 4 Metric Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f3d2e] text-white rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-100">
                Total Tracked Tasks
              </span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight">{total}</div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
              <span>+5 vs last sprint cycle</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                In Progress Velocity
              </span>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {inProgressCount}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Active Rollouts
              </span>
              <span>300ms cache parity</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                In Review & PRs
              </span>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {inReviewCount}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                QA Verification
              </span>
              <span>4 pending approval</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Completed & Merged
              </span>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {doneCount}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                100% Staged
              </span>
              <span>0 regressions</span>
            </div>
          </div>
        </section>

        {/* Main Work Area: Kanban or Table */}
        <section className="pt-2">
          {isLoading && !activeData ? (
            <TaskSkeleton viewMode={viewMode} />
          ) : isError && !activeData ? (
            <ErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Unable to load sprint tasks."
              }
              onRetry={() => refetch()}
            />
          ) : viewMode === "kanban" ? (
            <KanbanBoard tasks={activeData?.items || []} />
          ) : (
            <TaskTable
              data={
                activeData || {
                  items: [],
                  total: 0,
                  page: 1,
                  limit: 20,
                  totalPages: 1,
                  countsByStatus: {
                    backlog: 0,
                    todo: 0,
                    in_progress: 0,
                    in_review: 0,
                    done: 0,
                  },
                  countsByPriority: {
                    low: 0,
                    medium: 0,
                    high: 0,
                    urgent: 0,
                  },
                }
              }
              assignees={assignees}
            />
          )}
        </section>
      </main>

      {/* Validated Creation Modal & Rollback Toasts */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        assignees={assignees}
      />
      <ToastNotification />
    </div>
  );
}
