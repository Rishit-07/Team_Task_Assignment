"use client";

import React, { useRef, useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GripVertical,
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

  // Desktop drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(
    null
  );

  // Mobile/Phone touch drag-and-drop state
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const [touchDraggingTask, setTouchDraggingTask] = useState<Task | null>(null);
  const [touchHoldActive, setTouchHoldActive] = useState<boolean>(false);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Pagination per lane & mobile lane tab switcher
  const [columnPages, setColumnPages] = useState<Record<string, number>>({
    todo: 1,
    in_progress: 1,
    in_review: 1,
    done: 1,
  });
  const [mobileActiveLane, setMobileActiveLane] = useState<TaskStatus | "all">(
    "all"
  );
  const PAGE_SIZE = 5;

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

  // Desktop Drag Handlers
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

  // Mobile Touch Hold-and-Drag Handlers
  const handleCardTouchStart = (e: React.TouchEvent, task: Task) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

    // 220ms hold threshold distinguishes intentional drag from normal page scroll
    touchTimerRef.current = setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(35);
        } catch {}
      }
      setTouchDraggingTask(task);
      setTouchHoldActive(true);
      setTouchPos({ x: touch.clientX, y: touch.clientY });
    }, 220);
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];

    // If hold delay is still pending, cancel if finger scrolls away
    if (!touchHoldActive && touchStartPosRef.current) {
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
      if (dx > 10 || dy > 10) {
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
      return;
    }

    // Active touch dragging
    if (touchHoldActive) {
      setTouchPos({ x: touch.clientX, y: touch.clientY });

      // Identify column element under current finger position
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const colElem = elem?.closest("[data-column-id]");
      const colId = colElem?.getAttribute(
        "data-column-id"
      ) as TaskStatus | null;

      if (colId && activeDropColumn !== colId) {
        setActiveDropColumn(colId);
      } else if (!colId && activeDropColumn !== null) {
        setActiveDropColumn(null);
      }
    }
  };

  const handleCardTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    if (touchHoldActive && touchDraggingTask && activeDropColumn) {
      if (touchDraggingTask.status !== activeDropColumn) {
        updateTask.mutate({
          id: touchDraggingTask.id,
          updates: { status: activeDropColumn },
        });
      }
    }

    setTouchHoldActive(false);
    setTouchDraggingTask(null);
    setTouchPos(null);
    setActiveDropColumn(null);
    touchStartPosRef.current = null;
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
    <div className="space-y-4">
      {/* Mobile Lane Selector: Prevents endless vertical scrolling on phones */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setMobileActiveLane("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            mobileActiveLane === "all"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
              : "bg-white dark:bg-[#0d1424] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#131c31]"
          }`}
        >
          All Lanes ({tasks.length})
        </button>
        {COLUMNS.map((col) => {
          const count = (tasksByColumn[col.id] || []).length;
          const isSelected = mobileActiveLane === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileActiveLane(col.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                  : "bg-white dark:bg-[#0d1424] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#131c31]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <span>{col.label}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((column) => {
          // If on mobile and a single lane is selected, hide the others
          if (
            mobileActiveLane !== "all" &&
            mobileActiveLane !== column.id
          ) {
            return null;
          }

          const columnTasks = tasksByColumn[column.id] || [];
          const totalTasks = columnTasks.length;
          const totalPages = Math.ceil(totalTasks / PAGE_SIZE) || 1;
          const currentPage = Math.min(
            columnPages[column.id] || 1,
            totalPages
          );
          const paginatedTasks = columnTasks.slice(
            (currentPage - 1) * PAGE_SIZE,
            currentPage * PAGE_SIZE
          );
          const isDropActive = activeDropColumn === column.id;

          return (
            <div
              key={column.id}
              data-column-id={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-3xl p-3.5 border transition-all duration-200 min-h-[520px] ${
                column.bgLight
              } ${column.borderLight} ${
                isDropActive ? "ring-2 ring-emerald-500 scale-[1.01]" : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 pb-3 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`}
                  />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {column.label}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-[#1a2438] text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700/60 shadow-2xs">
                    {totalTasks}
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
                  paginatedTasks.map((task) => {
                    const progress = getTaskProgress(task);
                    const initials = getAssigneeInitials(task.assignee.name);
                    const isTouchActiveOnCard =
                      touchDraggingTask?.id === task.id && touchHoldActive;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onTouchStart={(e) => handleCardTouchStart(e, task)}
                        onTouchMove={handleCardTouchMove}
                        onTouchEnd={handleCardTouchEnd}
                        onTouchCancel={handleCardTouchEnd}
                        className={`group bg-white dark:bg-[#162032] rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800/90 transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-slate-200 dark:hover:border-slate-700/80 relative select-none ${
                          isTouchActiveOnCard
                            ? "ring-2 ring-emerald-500 scale-[1.02] shadow-xl opacity-80"
                            : ""
                        }`}
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
                            {/* Drag Grip Indicator */}
                            <span
                              title="Hold and drag to move"
                              className="text-slate-300 dark:text-slate-600 p-0.5"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>

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
                              <option value="todo" className="dark:bg-[#1a263c]">
                                To Do
                              </option>
                              <option
                                value="in_progress"
                                className="dark:bg-[#1a263c]"
                              >
                                In Progress
                              </option>
                              <option
                                value="in_review"
                                className="dark:bg-[#1a263c]"
                              >
                                In Review
                              </option>
                              <option value="done" className="dark:bg-[#1a263c]">
                                Completed
                              </option>
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

              {/* Lane Pagination: Keeps columns compact without infinite scrolling */}
              {totalPages > 1 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    Page{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {currentPage}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {totalPages}
                    </strong>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setColumnPages((prev) => ({
                          ...prev,
                          [column.id]: Math.max(1, currentPage - 1),
                        }))
                      }
                      disabled={currentPage <= 1}
                      aria-label={`Previous page of ${column.label}`}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-[#1a2438] border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-[#22314d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-200 font-medium flex items-center gap-0.5"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>Prev</span>
                    </button>
                    <button
                      onClick={() =>
                        setColumnPages((prev) => ({
                          ...prev,
                          [column.id]: Math.min(totalPages, currentPage + 1),
                        }))
                      }
                      disabled={currentPage >= totalPages}
                      aria-label={`Next page of ${column.label}`}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-[#1a2438] border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-[#22314d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-200 font-medium flex items-center gap-0.5"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Ghost Badge under finger during phone touch drag */}
      {touchHoldActive && touchDraggingTask && touchPos && (
        <div
          style={{
            position: "fixed",
            left: `${touchPos.x}px`,
            top: `${touchPos.y - 40}px`,
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 px-3.5 py-2 rounded-2xl shadow-2xl border border-emerald-500/80 backdrop-blur-md flex items-center gap-2 text-xs font-bold max-w-[260px] truncate animate-pulse"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="truncate">{touchDraggingTask.title}</span>
        </div>
      )}

      {/* Mobile Quick Drop Bar: Appears on phones when holding a card */}
      {touchHoldActive && touchDraggingTask && (
        <div className="fixed bottom-4 inset-x-4 z-50 p-2 rounded-2xl bg-slate-950/90 dark:bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md flex items-center justify-between gap-1.5 animate-in slide-in-from-bottom-5">
          {COLUMNS.map((col) => {
            const isTargetActive = activeDropColumn === col.id;
            return (
              <div
                key={col.id}
                data-column-id={col.id}
                className={`flex-1 py-3 px-1 rounded-xl text-center text-[11px] font-bold transition-all border ${
                  isTargetActive
                    ? "bg-emerald-500 text-white border-emerald-400 scale-[1.04] shadow-lg"
                    : "bg-slate-800/80 text-slate-300 border-slate-700"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="truncate">{col.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
