"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Assignee,
  PaginatedTasksResponse,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Eye,
  Layers,
  Table as TableIcon,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";

interface TaskTableProps {
  data: PaginatedTasksResponse;
  assignees: Assignee[];
}

export default function TaskTable({ data, assignees }: TaskTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobileLayout, setMobileLayout] = useState<"card" | "table">("card");

  const toggleExpand = (id: string) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  };

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTask(null);
      }
    };
    if (selectedTask) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedTask]);

  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "asc");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(newLimit));
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    updateTask.mutate({
      id,
      updates: { status: newStatus },
    });
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handlePriorityChange = (id: string, newPriority: TaskPriority) => {
    updateTask.mutate({
      id,
      updates: { priority: newPriority },
    });
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask((prev) =>
        prev ? { ...prev, priority: newPriority } : null
      );
    }
  };

  const handleAssigneeChange = (id: string, assigneeId: string) => {
    const match = assignees.find((a) => a.id === assigneeId);
    if (match) {
      updateTask.mutate({
        id,
        updates: { assignee: match },
      });
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask((prev) =>
          prev ? { ...prev, assignee: match } : null
        );
      }
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete task "${title}"?`)) {
      deleteTask.mutate(id);
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
    }
  };

  const getSortIcon = (field: string) => {
    if (currentSortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />;
    }
    return currentSortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
    );
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "text-[#b91c1c] dark:text-rose-300 bg-[#fee2e2] dark:bg-rose-950/50 border-[#fecaca] dark:border-rose-900/40";
      case "medium":
        return "text-[#15803d] dark:text-emerald-300 bg-[#dcfce7] dark:bg-emerald-950/50 border-[#bbf7d0] dark:border-emerald-900/40";
      case "low":
        return "text-[#0369a1] dark:text-sky-300 bg-[#e0f2fe] dark:bg-sky-950/50 border-[#bae6fd] dark:border-sky-900/40";
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "text-[#7c3aed] dark:text-purple-300 bg-[#f5f3ff] dark:bg-purple-950/50 border-[#ddd6fe] dark:border-purple-900/40";
      case "in_review":
        return "text-[#0284c7] dark:text-sky-300 bg-[#f0f9ff] dark:bg-sky-950/50 border-[#bae6fd] dark:border-sky-900/40";
      case "in_progress":
        return "text-[#d97706] dark:text-amber-300 bg-[#fef9ee] dark:bg-amber-950/50 border-[#fde68a] dark:border-amber-900/40";
      case "todo":
      case "backlog":
        return "text-[#e11d48] dark:text-rose-300 bg-[#fff1f4] dark:bg-rose-950/50 border-[#ffe4e9] dark:border-rose-900/40";
    }
  };

  return (
    <div className="bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xs overflow-hidden flex flex-col">
      {/* Mobile-Only Header Controls (Allows quick toggle between Mobile Card View & Scrollable Table) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#131c31]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Mobile Display:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-[#1a253c] p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileLayout("card")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              mobileLayout === "card"
                ? "bg-white dark:bg-[#0d1424] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileLayout("table")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              mobileLayout === "table"
                ? "bg-white dark:bg-[#0d1424] text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Mobile Card List View (< md screen when "card" is active) */}
      {mobileLayout === "card" && (
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.items.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
              No matching tasks found. Adjust search or active filters.
            </div>
          ) : (
            data.items.map((task) => (
              <div
                key={task.id}
                className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-[#131d33] transition-colors"
              >
                {/* Title and Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(task)}
                    className="text-left font-bold text-slate-900 dark:text-slate-100 text-sm whitespace-normal break-words leading-snug hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
                  >
                    {task.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id, task.title)}
                    aria-label={`Delete task ${task.title}`}
                    className="p-1 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded shrink-0 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <p
                    className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed ${
                      expandedTaskId === task.id
                        ? "whitespace-normal break-words"
                        : "line-clamp-2"
                    }`}
                  >
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(task.id)}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>
                        {expandedTaskId === task.id
                          ? "Hide full description"
                          : "Show full description"}
                      </span>
                      {expandedTaskId === task.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View all details</span>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-[#1a263c] text-slate-500 dark:text-slate-400 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata Row: Stage, Priority, Assignee & Due Date */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Stage
                    </label>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as TaskStatus)
                      }
                      aria-label={`Stage for ${task.title}`}
                      className={`w-full text-xs font-semibold capitalize px-2.5 py-1 rounded-xl border outline-none cursor-pointer ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      <option value="todo" className="dark:bg-[#131c31]">To Do</option>
                      <option value="in_progress" className="dark:bg-[#131c31]">In Progress</option>
                      <option value="in_review" className="dark:bg-[#131c31]">In Review</option>
                      <option value="done" className="dark:bg-[#131c31]">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Priority
                    </label>
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        handlePriorityChange(
                          task.id,
                          e.target.value as TaskPriority
                        )
                      }
                      aria-label={`Priority for ${task.title}`}
                      className={`w-full text-xs font-semibold capitalize px-2.5 py-1 rounded-xl border outline-none cursor-pointer ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      <option value="urgent" className="dark:bg-[#131c31]">Urgent</option>
                      <option value="high" className="dark:bg-[#131c31]">High</option>
                      <option value="medium" className="dark:bg-[#131c31]">Medium</option>
                      <option value="low" className="dark:bg-[#131c31]">Low</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {task.assignee.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <select
                        value={task.assignee.id}
                        onChange={(e) =>
                          handleAssigneeChange(task.id, e.target.value)
                        }
                        aria-label={`Assignee for ${task.title}`}
                        className="text-xs bg-transparent border-0 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer truncate max-w-[150px]"
                      >
                        {assignees.map((a) => (
                          <option key={a.id} value={a.id} className="dark:bg-[#131c31]">
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View (Desktop & Tablet always visible; on mobile visible when "table" layout is chosen) */}
      <div
        className={`overflow-x-auto ${
          mobileLayout === "card" ? "hidden md:block" : "block"
        }`}
      >
        {mobileLayout === "table" && (
          <div className="md:hidden px-4 py-2 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>Swipe table left/right to view all columns. Tap task title for full details.</span>
          </div>
        )}

        <table className="w-full min-w-[780px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#131c31] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold text-[11px]">
              <th
                onClick={() => handleSort("title")}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none min-w-[280px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Details</span>
                  {getSortIcon("title")}
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none w-36"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                onClick={() => handleSort("priority")}
                className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none w-32"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {getSortIcon("priority")}
                </div>
              </th>
              <th className="py-3.5 px-3 select-none w-44">
                <span>Assignee</span>
              </th>
              <th
                onClick={() => handleSort("dueDate")}
                className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none w-32"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  {getSortIcon("dueDate")}
                </div>
              </th>
              <th className="py-3.5 px-5 text-right w-16">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  No matching tasks found. Adjust search or active filters.
                </td>
              </tr>
            ) : (
              data.items.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-[#131d33] transition-colors"
                >
                  <td className="py-3.5 px-5 min-w-[280px] max-w-md align-top">
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        className="text-left font-bold text-slate-900 dark:text-slate-100 text-xs whitespace-normal break-words leading-snug hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
                      >
                        {task.title}
                      </button>
                      <p
                        className={`text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed ${
                          expandedTaskId === task.id
                            ? "whitespace-normal break-words"
                            : "line-clamp-2"
                        }`}
                      >
                        {task.description}
                      </p>
                      <div className="flex items-center gap-3 pt-0.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(task.id)}
                          className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>
                            {expandedTaskId === task.id
                              ? "Hide full description"
                              : "Show full description"}
                          </span>
                          {expandedTaskId === task.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTask(task)}
                          className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View all details</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {task.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-[#1a263c] text-slate-500 dark:text-slate-400 rounded-full"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as TaskStatus)
                      }
                      aria-label={`Stage for ${task.title}`}
                      className={`text-[11px] font-semibold capitalize px-2.5 py-1 rounded-full border outline-none cursor-pointer ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      <option value="todo" className="dark:bg-[#131c31]">To Do</option>
                      <option value="in_progress" className="dark:bg-[#131c31]">In Progress</option>
                      <option value="in_review" className="dark:bg-[#131c31]">In Review</option>
                      <option value="done" className="dark:bg-[#131c31]">Completed</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-3">
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        handlePriorityChange(
                          task.id,
                          e.target.value as TaskPriority
                        )
                      }
                      aria-label={`Priority for ${task.title}`}
                      className={`text-[11px] font-semibold capitalize px-2.5 py-1 rounded-full border outline-none cursor-pointer ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      <option value="urgent" className="dark:bg-[#131c31]">Urgent</option>
                      <option value="high" className="dark:bg-[#131c31]">High</option>
                      <option value="medium" className="dark:bg-[#131c31]">Medium</option>
                      <option value="low" className="dark:bg-[#131c31]">Low</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {task.assignee.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <select
                        value={task.assignee.id}
                        onChange={(e) =>
                          handleAssigneeChange(task.id, e.target.value)
                        }
                        aria-label={`Assignee for ${task.title}`}
                        className="text-xs bg-transparent border-0 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer max-w-[110px] truncate"
                      >
                        {assignees.map((a) => (
                          <option key={a.id} value={a.id} className="dark:bg-[#131c31]">
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{task.dueDate}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleDelete(task.id, task.title)}
                      aria-label={`Delete task ${task.title}`}
                      className="p-1 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131c31] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Page <strong className="text-slate-900 dark:text-slate-100">{data.page}</strong> of{" "}
            <strong className="text-slate-900 dark:text-slate-100">{data.totalPages}</strong> (
            {data.total} total items)
          </span>

          <div className="flex items-center gap-1.5">
            <span>Show:</span>
            <select
              value={data.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              aria-label="Items per page"
              className="bg-white dark:bg-[#18233c] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-0.5 text-xs outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(data.page - 1)}
            disabled={data.page <= 1}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-[#18233c] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#202e4d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-200 font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page >= data.totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-[#18233c] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#202e4d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-200 font-medium"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Task Details Modal (Phone & Desktop Accessible) */}
      {selectedTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedTask(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#0e1629] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#131d33]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  Task #{selectedTask.id.slice(-6)}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Full Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                aria-label="Close task details"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-left">
              {/* Full Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Title
                </label>
                <h3
                  id="task-detail-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-100 whitespace-normal break-words leading-snug"
                >
                  {selectedTask.title}
                </h3>
              </div>

              {/* Full Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Description
                </label>
                <div className="p-3.5 bg-slate-50/70 dark:bg-[#141f38] border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-normal break-words leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>
              </div>

              {/* Status and Priority selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Stage
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedTask.id,
                        e.target.value as TaskStatus
                      )
                    }
                    aria-label={`Update stage for ${selectedTask.title}`}
                    className={`w-full text-xs font-semibold capitalize px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${getStatusStyle(
                      selectedTask.status
                    )}`}
                  >
                    <option value="todo" className="dark:bg-[#131c31]">To Do</option>
                    <option value="in_progress" className="dark:bg-[#131c31]">In Progress</option>
                    <option value="in_review" className="dark:bg-[#131c31]">In Review</option>
                    <option value="done" className="dark:bg-[#131c31]">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) =>
                      handlePriorityChange(
                        selectedTask.id,
                        e.target.value as TaskPriority
                      )
                    }
                    aria-label={`Update priority for ${selectedTask.title}`}
                    className={`w-full text-xs font-semibold capitalize px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${getPriorityStyle(
                      selectedTask.priority
                    )}`}
                  >
                    <option value="urgent" className="dark:bg-[#131c31]">Urgent</option>
                    <option value="high" className="dark:bg-[#131c31]">High</option>
                    <option value="medium" className="dark:bg-[#131c31]">Medium</option>
                    <option value="low" className="dark:bg-[#131c31]">Low</option>
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Assignee
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-[#141f38] border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {selectedTask.assignee.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <select
                      value={selectedTask.assignee.id}
                      onChange={(e) =>
                        handleAssigneeChange(selectedTask.id, e.target.value)
                      }
                      aria-label="Change assignee"
                      className="text-xs font-semibold text-slate-900 dark:text-slate-100 bg-transparent outline-none cursor-pointer w-full"
                    >
                      {assignees.map((a) => (
                        <option key={a.id} value={a.id} className="dark:bg-[#131c31]">
                          {a.name} ({a.role})
                        </option>
                      ))}
                    </select>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {selectedTask.assignee.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Grid: Due Date, Created At */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50/70 dark:bg-[#141f38] border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Due Date</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTask.dueDate}
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 dark:bg-[#141f38] border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Created</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTask.createdAt.split("T")[0]}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedTask.tags.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium px-2.5 py-1 bg-slate-100 dark:bg-[#1a263c] text-slate-600 dark:text-slate-300 rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>#{t}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#131d33] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedTask.id, selectedTask.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
