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
    bgLight: "bg-[#fff1f4]",
    borderLight: "border-[#ffe4e9]",
    badgeBg: "bg-white",
    badgeText: "text-slate-600",
    nextStatus: "in_progress",
    nextLabel: "Move to In Progress",
  },
  {
    id: "in_progress",
    label: "In Progress",
    dotColor: "bg-[#d97706]",
    bgLight: "bg-[#fef9ee]",
    borderLight: "border-[#fef0d5]",
    badgeBg: "bg-white",
    badgeText: "text-slate-600",
    nextStatus: "in_review",
    nextLabel: "Move to In Review",
  },
  {
    id: "in_review",
    label: "In Review",
    dotColor: "bg-[#0284c7]",
    bgLight: "bg-[#f0f9ff]",
    borderLight: "border-[#e0f2fe]",
    badgeBg: "bg-white",
    badgeText: "text-slate-600",
    nextStatus: "done",
    nextLabel: "Move to Completed",
  },
  {
    id: "done",
    label: "Completed",
    dotColor: "bg-[#7c3aed]",
    bgLight: "bg-[#f5f3ff]",
    borderLight: "border-[#ede9fe]",
    badgeBg: "bg-white",
    badgeText: "text-slate-600",
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
        return "bg-[#fee2e2] text-[#b91c1c]";
      case "medium":
        return "bg-[#dcfce7] text-[#15803d]";
      case "low":
        return "bg-[#e0f2fe] text-[#0369a1]";
      default:
        return "bg-[#f1f5f9] text-[#475569]";
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
                <h3 className="font-bold text-sm text-slate-800">
                  {column.label}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90 text-slate-600 shadow-2xs">
                  {columnTasks.length}
                </span>
              </div>

              <div className="text-slate-400">
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-slate-600" />
              </div>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-3 flex-1">
              {columnTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-300/80 rounded-2xl text-center">
                  <p className="text-xs font-medium text-slate-500">
                    No tasks in this lane
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5">
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
                      className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-100 transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-slate-200 relative"
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
                            className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-600 outline-none cursor-pointer"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="done">Completed</option>
                          </select>

                          <button
                            onClick={() => handleDelete(task.id, task.title)}
                            aria-label={`Delete task ${task.title}`}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-[13px] text-slate-900 leading-snug line-clamp-2 mb-1">
                        {task.title}
                      </h4>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
                        {task.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mb-3.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold text-slate-700">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white"
                            title={task.assignee.name}
                          >
                            {initials}
                          </div>
                          <span className="text-[11px] font-medium text-slate-600 truncate max-w-[90px]">
                            {task.assignee.name.split(" ")[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>1</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
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
                          className="mt-3 w-full py-1.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>{column.nextLabel}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
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
