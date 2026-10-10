"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Assignee, TaskPriority, TaskStatus } from "@/types/task";
import { useCreateTask } from "@/hooks/useTasks";
import { AlertCircle, Plus, X } from "lucide-react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignees: Assignee[];
}

const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must contain at least 3 characters.")
    .max(120, "Task title cannot exceed 120 characters."),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigneeId: z.string().min(1, "Please designate an assignee."),
  dueDate: z.string().min(1, "Due date is required."),
  tags: z.string().optional(),
});

export default function CreateTaskModal({
  isOpen,
  onClose,
  assignees,
}: CreateTaskModalProps) {
  const createTask = useCreateTask();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    assigneeId: assignees[0]?.id || "usr_1",
    dueDate: new Date().toISOString().split("T")[0],
    tags: "frontend, platform",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = taskSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const tagList = formData.tags
      ? formData.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    createTask.mutate(
      {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId,
        dueDate: formData.dueDate,
        tags: tagList,
      },
      {
        onSuccess: () => {
          onClose();
          setFormData({
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            assigneeId: assignees[0]?.id || "usr_1",
            dueDate: new Date().toISOString().split("T")[0],
            tags: "frontend, platform",
          });
        },
      }
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3
              id="modal-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              Create New Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify objective, assignment, and deliverable priority
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label
              htmlFor="task-title"
              className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Audit session caching for edge workers"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.title && (
              <p className="text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-desc"
              className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Description *
            </label>
            <textarea
              id="task-desc"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detail the technical requirements and validation scope..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.description && (
              <p className="text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Grid row: Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-status"
                className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Initial Lane
              </label>
              <select
                id="task-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="task-priority"
                className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Priority
              </label>
              <select
                id="task-priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Grid row: Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-assignee"
                className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Assignee
              </label>
              <select
                id="task-assignee"
                value={formData.assigneeId}
                onChange={(e) =>
                  setFormData({ ...formData, assigneeId: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-duedate"
                className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Target Date
              </label>
              <input
                id="task-duedate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="task-tags"
              className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Tags (comma separated)
            </label>
            <input
              id="task-tags"
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="infra, security, release-v2"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{createTask.isPending ? "Creating..." : "Save Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
