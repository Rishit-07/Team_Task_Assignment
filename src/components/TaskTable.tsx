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
        return "text-[#b91c1c] bg-[#fee2e2] border-[#fecaca]";
      case "medium":
        return "text-[#15803d] bg-[#dcfce7] border-[#bbf7d0]";
      case "low":
        return "text-[#0369a1] bg-[#e0f2fe] border-[#bae6fd]";
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "text-[#7c3aed] bg-[#f5f3ff] border-[#ddd6fe]";
      case "in_review":
        return "text-[#0284c7] bg-[#f0f9ff] border-[#bae6fd]";
      case "in_progress":
        return "text-[#d97706] bg-[#fef9ee] border-[#fde68a]";
      case "todo":
      case "backlog":
        return "text-[#e11d48] bg-[#fff1f4] border-[#ffe4e9]";
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              <th
                onClick={() => handleSort("title")}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Details</span>
                  {getSortIcon("title")}
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="py-3.5 px-3 cursor-pointer hover:text-slate-900 select-none w-36"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                onClick={() => handleSort("priority")}
                className="py-3.5 px-3 cursor-pointer hover:text-slate-900 select-none w-32"
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
                className="py-3.5 px-3 cursor-pointer hover:text-slate-900 select-none w-32"
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
          <tbody className="divide-y divide-slate-100 text-slate-700">
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
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-5 max-w-sm">
                    <div className="font-bold text-slate-900 text-xs mb-0.5 line-clamp-1">
                      {task.title}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-1">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full"
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
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
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
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
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
                        className="text-xs bg-transparent border-0 text-slate-800 font-medium outline-none cursor-pointer max-w-[110px] truncate"
                      >
                        {assignees.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.dueDate}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleDelete(task.id, task.title)}
                      aria-label={`Delete task ${task.title}`}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
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

      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            Page <strong className="text-slate-900">{data.page}</strong> of{" "}
            <strong className="text-slate-900">{data.totalPages}</strong> (
            {data.total} total items)
          </span>

          <div className="flex items-center gap-1.5">
            <span>Show:</span>
            <select
              value={data.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              aria-label="Items per page"
              className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs outline-none cursor-pointer"
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
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page >= data.totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-medium"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
