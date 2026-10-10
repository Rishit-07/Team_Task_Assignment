"use client";

import React, { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAssignees, useTasks } from "@/hooks/useTasks";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { TaskFilterParams, TaskPriority, TaskStatus } from "@/types/task";
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
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Columns3,
  FileText,
  Filter,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Table as TableIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardView() {
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

  // URL query params
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

  // Build query filters object
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
  } = useTasks(filters);
  const { data: assignees = [] } = useAssignees();

  // Search input with instant URL sync
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
          description: "Restored 105 seeded tasks.",
          type: "success",
        });
      }
    } catch {
      showToast({
        title: "Reset Failed",
        description: "Could not reset mock data.",
        type: "error",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Metrics calculation
  const total = tasksData?.total ?? 105;
  const inProgressCount = tasksData?.countsByStatus?.in_progress ?? 28;
  const inReviewCount = tasksData?.countsByStatus?.in_review ?? 14;
  const doneCount = tasksData?.countsByStatus?.done ?? 42;

  return (
    <div className="min-h-screen bg-[#f6f8f7] flex">
      {/* Left Sidebar matching reference image */}
      <aside className="w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 hidden lg:flex">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0f3d2e] flex items-center justify-center text-white">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
                Donezo
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Sprint Engine
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Workspace
            </span>

            <button
              onClick={() => setViewMode("table")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setViewMode("kanban")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#0f3d2e] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Columns3 className="w-4 h-4" />
                <span>Tasks / Kanban</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  viewMode === "kanban"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {total}
              </span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Calendar</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>Analytics</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Team</span>
            </button>
          </div>

          <div className="space-y-1 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Preferences
            </span>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Docs</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Sprint Cycle Card at bottom */}
        <div className="bg-[#f6f8f7] rounded-2xl p-3.5 border border-slate-200/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Sprint 28 Cycle
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            82 of 105 tasks merged to staging cluster.
          </p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full w-[78%]" />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
            <span>Target: 3 days left</span>
            <span>78%</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header matching reference image */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 shrink-0">
          {/* Global search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md hidden sm:block"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks, commits, assignees..."
              className="w-full pl-10 pr-12 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/70">
              ⌘K
            </span>
          </form>

          {/* Controls: Chaos Toggle, Delay, Reset, User profile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Sync Parity</span>
            </div>

            {/* Latency badge */}
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value={0}>0ms</option>
                <option value={300}>300ms</option>
                <option value={800}>800ms</option>
              </select>
            </div>

            {/* Mutation failure simulation toggle */}
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

            {/* Reset data */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`}
              />
              <span>Seed 105</span>
            </button>

            {/* Notifications icon */}
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
              <Bell className="w-4 h-4" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white font-bold text-xs flex items-center justify-center">
                TM
              </div>
              <div className="hidden md:block text-left">
                <span className="font-bold text-xs text-slate-900 block leading-tight">
                  Totok Michael
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Lead Engineer
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Project Header section matching reference image */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
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

            {/* Team stack and header action buttons */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="flex items-center -space-x-1.5 mr-2">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                  AR
                </span>
                <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                  EC
                </span>
                <span className="w-7 h-7 rounded-full bg-indigo-700 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                  MV
                </span>
                <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                  SJ
                </span>
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                  +5
                </span>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f3d2e] hover:bg-[#0c3527] text-white text-xs font-semibold shadow-xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite People</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs matching reference */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setViewMode("table")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  viewMode === "table"
                    ? "bg-[#0f3d2e] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  viewMode === "kanban"
                    ? "bg-[#dcfce7] text-[#0f3d2e] font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Columns3 className="w-3.5 h-3.5 text-[#0f3d2e]" />
                <span>Board</span>
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Messages</span>
              </button>
            </div>

            {/* Filter and New Task Actions */}
            <div className="flex items-center gap-2.5">
              {/* Sort by */}
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                <span>Sort by:</span>
                <select
                  value={urlSortBy}
                  onChange={(e) => updateParam("sortBy", e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="status">Stage</option>
                  <option value="priority">Priority</option>
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title</option>
                </select>
              </div>

              {/* Filter button */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsFilterDropdownOpen(!isFilterDropdownOpen)
                  }
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
                        onChange={(e) =>
                          updateParam("priority", e.target.value)
                        }
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

              {/* Add New Task button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0f3d2e] hover:bg-[#0c3527] text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Task</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Summary Cards matching reference image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Tracked Tasks (Dark Forest Green) */}
            <div className="bg-[#0f3d2e] text-white rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-100">
                  Total Tracked Tasks
                </span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight">
                {total}
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                <span>+5 vs last sprint cycle</span>
              </div>
            </div>

            {/* Card 2: In Progress Velocity */}
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

            {/* Card 3: In Review & PRs */}
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

            {/* Card 4: Completed & Merged */}
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
          </div>

          {/* Main Task View: Kanban or Table */}
          <section className="pt-2">
            {isLoading ? (
              <TaskSkeleton viewMode={viewMode} />
            ) : isError ? (
              <ErrorState
                message={
                  error instanceof Error
                    ? error.message
                    : "Unable to load sprint tasks."
                }
                onRetry={() => refetch()}
              />
            ) : viewMode === "kanban" ? (
              <KanbanBoard tasks={tasksData?.items || []} />
            ) : (
              <TaskTable
                data={
                  tasksData || {
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
        </div>

        {/* Global Modals and Alerts */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          assignees={assignees}
        />
        <ToastNotification />
      </div>
    </div>
  );
}
