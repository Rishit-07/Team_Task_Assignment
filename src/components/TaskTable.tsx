"use client";

import React from "react";
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
      <ArrowUp className="w-3.5 h-3.5 text-indigo-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-500" />
    );
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "low":
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "in_review":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "in_progress":
        return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      case "todo":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "backlog":
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <th
                onClick={() => handleSort("title")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none"
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
                  <span>Status</span>
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
              <th className="py-3.5 px-4 text-right w-16">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No matching tasks found. Adjust search or active filters.
                </td>
              </tr>
            ) : (
              data.items.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Title & tags */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs mb-1 line-clamp-1">
                      {task.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Inline Select (Optimistic) */}
                  <td className="py-3.5 px-3">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as TaskStatus)
                      }
                      aria-label={`Change status for ${task.title}`}
                      className={`text-[11px] font-medium uppercase tracking-wider px-2 py-1 rounded border outline-none cursor-pointer ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>

                  {/* Priority Inline Select (Optimistic) */}
                  <td className="py-3.5 px-3">
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        handlePriorityChange(
                          task.id,
                          e.target.value as TaskPriority
                        )
                      }
                      aria-label={`Change priority for ${task.title}`}
                      className={`text-[11px] font-medium uppercase tracking-wider px-2 py-1 rounded border outline-none cursor-pointer ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>

                  {/* Assignee Inline Select */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.assignee.avatarUrl}
                        alt={task.assignee.name}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <select
                        value={task.assignee.id}
                        onChange={(e) =>
                          handleAssigneeChange(task.id, e.target.value)
                        }
                        aria-label={`Assignee for ${task.title}`}
                        className="text-xs bg-transparent border-0 text-slate-800 dark:text-slate-200 outline-none cursor-pointer max-w-[110px] truncate"
                      >
                        {assignees.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.dueDate}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(task.id, task.title)}
                      aria-label={`Delete task ${task.title}`}
                      className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded transition-colors"
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

      {/* Pagination Bar */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
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
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded px-2 py-0.5 text-xs outline-none cursor-pointer"
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
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-200"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page >= data.totalPages}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-200"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
