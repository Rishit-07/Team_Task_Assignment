"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Assignee,
  PaginatedTasksResponse,
  TaskPriority,
  TaskStatus,
} from "@/types/task";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

interface TaskTableProps {
  data: PaginatedTasksResponse;
  assignees: Assignee[];
}

export default function TaskTable({ data, assignees }: TaskTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

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
  };

  const handlePriorityChange = (id: string, newPriority: TaskPriority) => {
    updateTask.mutate({
      id,
      updates: { priority: newPriority },
    });
  };

  const handleAssigneeChange = (id: string, assigneeId: string) => {
    const match = assignees.find((a) => a.id === assigneeId);
    if (match) {
      updateTask.mutate({
        id,
        updates: { assignee: match },
      });
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete task "${title}"?`)) {
      deleteTask.mutate(id);
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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#131c31] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold text-[11px]">
              <th
                onClick={() => handleSort("title")}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none"
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
                  <td className="py-3.5 px-5 max-w-sm">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-0.5 line-clamp-1">
                      {task.title}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1 mb-1">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-[#1a263c] text-slate-500 dark:text-slate-400 rounded-full"
                        >
                          #{t}
                        </span>
                      ))}
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
    </div>
  );
}
