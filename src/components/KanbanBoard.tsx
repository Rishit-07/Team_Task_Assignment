"use client";

import React, { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  MoreVertical,
  MoveRight,
  Trash2,
  User,
} from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS: { id: TaskStatus; label: string; accentColor: string }[] = [
  { id: "backlog", label: "Backlog", accentColor: "border-slate-400 text-slate-400" },
  { id: "todo", label: "To Do", accentColor: "border-blue-400 text-blue-400" },
  { id: "in_progress", label: "In Progress", accentColor: "border-indigo-400 text-indigo-400" },
  { id: "in_review", label: "In Review", accentColor: "border-amber-400 text-amber-400" },
  { id: "done", label: "Done", accentColor: "border-emerald-400 text-emerald-400" },
];

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  // Group tasks by column status
  const tasksByColumn: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  };

  tasks.forEach((t) => {
    if (tasksByColumn[t.status]) {
      tasksByColumn[t.status].push(t);
    } else {
      tasksByColumn.backlog.push(t);
    }
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (activeDropColumn !== columnId) {
      setActiveDropColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setActiveDropColumn(null);
    setDraggedTaskId(null);

    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    updateTask.mutate({
      id: taskId,
      updates: { status: targetStatus },
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask.mutate({
      id: taskId,
      updates: { status: newStatus },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Remove this task from the workspace?")) {
      deleteTask.mutate(id);
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = tasksByColumn[column.id];
        const isDropActive = activeDropColumn === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border transition-all duration-200 min-h-[500px] p-3 ${
              isDropActive
                ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10"
                : "border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.accentColor.split(" ")[0].replace("border-", "bg-")}`} />
                <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  {column.label}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-2.5 flex-1">
              {columnTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    No tasks in this lane
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                    Drag card here to update
                  </span>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="group relative bg-white dark:bg-slate-800/90 hover:dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    {/* Header: Priority & Keyboard Status Selector */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      {/* Accessible Keyboard Control: Dropdown to move status without dragging */}
                      <div className="flex items-center gap-1">
                        <label
                          htmlFor={`move-select-${task.id}`}
                          className="sr-only"
                        >
                          Move task {task.title} to status
                        </label>
                        <div className="relative inline-flex items-center">
                          <select
                            id={`move-select-${task.id}`}
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(
                                task.id,
                                e.target.value as TaskStatus
                              )
                            }
                            aria-label={`Move status for ${task.title}`}
                            className="text-[11px] bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer focus:ring-1 focus:ring-indigo-500"
                            title="Keyboard alternative: Select to change status"
                          >
                            <option value="backlog">Move: Backlog</option>
                            <option value="todo">Move: To Do</option>
                            <option value="in_progress">Move: In Progress</option>
                            <option value="in_review">Move: In Review</option>
                            <option value="done">Move: Done</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleDelete(task.id)}
                          aria-label={`Delete task ${task.title}`}
                          className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-1.5">
                      {task.title}
                    </h4>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {task.description}
                    </p>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 rounded border border-slate-200/50 dark:border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer: Assignee & Due Date */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                      <div
                        className="flex items-center gap-1.5"
                        title={`${task.assignee.name} (${task.assignee.role})`}
                      >
                        <img
                          src={task.assignee.avatarUrl}
                          alt={task.assignee.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <span className="font-medium truncate max-w-[80px]">
                          {task.assignee.name.split(" ")[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
