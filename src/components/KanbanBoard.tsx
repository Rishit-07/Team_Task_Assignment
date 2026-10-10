"use client";

import React, { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Trash2,
} from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
}

interface ColumnConfig {
  id: TaskStatus;
  label: string;
  dotColor: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  badgeText: string;
  nextStatus: TaskStatus | null;
  nextLabel: string | null;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "todo",
    label: "To Do",
    dotColor: "bg-[#e11d48]",
    bgLight: "bg-[#fff1f4] dark:bg-[#201017]",
    borderLight: "border-[#ffe4e9] dark:border-[#381624]",
    badgeBg: "bg-white dark:bg-[#2c1420]",
    badgeText: "text-slate-600 dark:text-rose-200",
    nextStatus: "in_progress",
    nextLabel: "Move to In Progress",
  },
  {
    id: "in_progress",
    label: "In Progress",
    dotColor: "bg-[#d97706]",
    bgLight: "bg-[#fef9ee] dark:bg-[#20180e]",
    borderLight: "border-[#fef0d5] dark:border-[#3d2913]",
    badgeBg: "bg-white dark:bg-[#2d1e0f]",
    badgeText: "text-slate-600 dark:text-amber-200",
    nextStatus: "in_review",
    nextLabel: "Move to In Review",
  },
  {
    id: "in_review",
    label: "In Review",
    dotColor: "bg-[#0284c7]",
    bgLight: "bg-[#f0f9ff] dark:bg-[#0c1828]",
    borderLight: "border-[#e0f2fe] dark:border-[#142e4c]",
    badgeBg: "bg-white dark:bg-[#11243b]",
    badgeText: "text-slate-600 dark:text-sky-200",
    nextStatus: "done",
    nextLabel: "Move to Completed",
  },
  {
    id: "done",
    label: "Completed",
    dotColor: "bg-[#7c3aed]",
    bgLight: "bg-[#f5f3ff] dark:bg-[#18112b]",
    borderLight: "border-[#ede9fe] dark:border-[#2f1f50]",
    badgeBg: "bg-white dark:bg-[#23173d]",
    badgeText: "text-slate-600 dark:text-purple-200",
    nextStatus: "in_review",
    nextLabel: "Reopen to In Review",
  },
];

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(
    null
  );

  // Group tasks across the 4 lanes (backlog maps into todo lane)
  const tasksByColumn: Record<string, Task[]> = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  };

  tasks.forEach((t) => {
    if (t.status === "backlog" || t.status === "todo") {
      tasksByColumn.todo.push(t);
    } else if (tasksByColumn[t.status]) {
      tasksByColumn[t.status].push(t);
    } else {
      tasksByColumn.todo.push(t);
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

  const handleDragLeave = () => {
    setActiveDropColumn(null);
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

  const handleMoveStatus = (taskId: string, targetStatus: TaskStatus) => {
    updateTask.mutate({
      id: taskId,
      updates: { status: targetStatus },
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteTask.mutate(id);
    }
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "bg-[#fee2e2] dark:bg-rose-950/60 text-[#b91c1c] dark:text-rose-300 border border-transparent dark:border-rose-900/40";
      case "medium":
        return "bg-[#dcfce7] dark:bg-emerald-950/60 text-[#15803d] dark:text-emerald-300 border border-transparent dark:border-emerald-900/40";
      case "low":
        return "bg-[#e0f2fe] dark:bg-sky-950/60 text-[#0369a1] dark:text-sky-300 border border-transparent dark:border-sky-900/40";
      default:
        return "bg-[#f1f5f9] dark:bg-slate-800 text-[#475569] dark:text-slate-400 border border-transparent dark:border-slate-700";
    }
  };

  const getTaskProgress = (task: Task) => {
    if (task.status === "done") return 100;
    if (task.status === "in_review") return 100;
    if (task.status === "in_progress") {
      // Deterministic progress based on task id for visual polish
      const num = parseInt(task.id.replace(/\D/g, "") || "5", 10);
      return 25 + (num % 5) * 15;
    }
    return 0;
  };

  const getAssigneeInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = tasksByColumn[column.id] || [];
        const isDropActive = activeDropColumn === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col rounded-3xl p-3.5 border transition-all duration-200 min-h-[580px] ${
              column.bgLight
            } ${column.borderLight} ${
              isDropActive ? "ring-2 ring-emerald-500 scale-[1.01]" : ""
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1.5 pb-3 mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {column.label}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-[#1a2438] text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700/60 shadow-2xs">
                  {columnTasks.length}
                </span>
              </div>

              <div className="text-slate-400">
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" />
              </div>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-3 flex-1">
              {columnTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-300/80 dark:border-slate-800 rounded-2xl text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    No tasks in this lane
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Drag items here
                  </span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const progress = getTaskProgress(task);
                  const initials = getAssigneeInitials(task.assignee.name);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="group bg-white dark:bg-[#162032] rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800/90 transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-slate-200 dark:hover:border-slate-700/80 relative"
                    >
                      {/* Top Row: Priority Badge & Move Dropdown */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Keyboard accessible status select */}
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleMoveStatus(
                                task.id,
                                e.target.value as TaskStatus
                              )
                            }
                            aria-label={`Change status for ${task.title}`}
                            className="text-[11px] font-medium bg-slate-50 dark:bg-[#1a263c] hover:bg-slate-100 dark:hover:bg-[#22314d] border border-slate-200 dark:border-slate-700/80 rounded-lg px-2 py-0.5 text-slate-600 dark:text-slate-200 outline-none cursor-pointer"
                          >
                            <option value="todo" className="dark:bg-[#1a263c]">To Do</option>
                            <option value="in_progress" className="dark:bg-[#1a263c]">In Progress</option>
                            <option value="in_review" className="dark:bg-[#1a263c]">In Review</option>
                            <option value="done" className="dark:bg-[#1a263c]">Completed</option>
                          </select>

                          <button
                            onClick={() => handleDelete(task.id, task.title)}
                            aria-label={`Delete task ${task.title}`}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-1">
                        {task.title}
                      </h4>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                        {task.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mb-3.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              task.status === "done"
                                ? "bg-emerald-500"
                                : "bg-emerald-600"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom Row: Assignee & Meta counts */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-[#162032]"
                            title={task.assignee.name}
                          >
                            {initials}
                          </div>
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[90px]">
                            {task.assignee.name.split(" ")[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span>1</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span>3</span>
                          </span>
                        </div>
                      </div>

                      {/* Action quick move button matching reference image */}
                      {column.nextStatus && (
                        <button
                          onClick={() =>
                            handleMoveStatus(task.id, column.nextStatus!)
                          }
                          className="mt-3 w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/60 dark:bg-[#1c2940] hover:bg-slate-100 dark:hover:bg-[#23334f] text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>{column.nextLabel}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
