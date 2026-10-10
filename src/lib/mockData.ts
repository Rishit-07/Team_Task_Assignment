import {
  Assignee,
  PaginatedTasksResponse,
  SimulationConfig,
  Task,
  TaskFilterParams,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

export const SEEDED_ASSIGNEES: Assignee[] = [
  {
    id: "usr_1",
    name: "Alex Chen",
    email: "alex.chen@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Staff Infrastructure Engineer",
  },
  {
    id: "usr_2",
    name: "Maya Patel",
    email: "maya.patel@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "Lead Product Designer",
  },
  {
    id: "usr_3",
    name: "Liam Vance",
    email: "liam.vance@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Senior Frontend Engineer",
  },
  {
    id: "usr_4",
    name: "Elena Rostova",
    email: "elena.rostova@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "Backend Architect",
  },
  {
    id: "usr_5",
    name: "Marcus Brody",
    email: "marcus.brody@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Security Engineer",
  },
  {
    id: "usr_6",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Product Operations Manager",
  },
  {
    id: "usr_7",
    name: "David Kim",
    email: "david.kim@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    role: "Fullstack Engineer",
  },
  {
    id: "usr_8",
    name: "Priya Nair",
    email: "priya.nair@platform.internal",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    role: "QA Automation Engineer",
  },
];

const TASK_TEMPLATES: {
  title: string;
  description: string;
  tags: string[];
  priority: TaskPriority;
  status: TaskStatus;
}[] = [
  {
    title: "Implement distributed session caching with Redis cluster",
    description: "Replace localized in-memory cache nodes with an auto-sharding cluster to maintain session resilience during node drains.",
    tags: ["infrastructure", "redis", "performance"],
    priority: "high",
    status: "in_progress",
  },
  {
    title: "Design token audit for high-contrast accessibility compliance",
    description: "Inspect border definitions, muted text variants, and focus indicators to reach WCAG 2.1 AA validation criteria.",
    tags: ["design-system", "accessibility", "tokens"],
    priority: "medium",
    status: "in_review",
  },
  {
    title: "Optimize TanStack Query stale time defaults for task grids",
    description: "Tune GC times and background polling frequency to prevent redundant network round-trips on rapid view swaps.",
    tags: ["frontend", "performance", "tanstack-query"],
    priority: "medium",
    status: "todo",
  },
  {
    title: "Audit OpenID Connect redirect loop in staging ingress",
    description: "Investigate SSL offloading mismatches causing auth redirect bounces across perimeter reverse proxies.",
    tags: ["security", "auth", "infra"],
    priority: "urgent",
    status: "in_progress",
  },
  {
    title: "Build keyboard focus traps for confirmation modals",
    description: "Ensure focus is locked within active modal dialogs and restored to the origin trigger on close.",
    tags: ["frontend", "a11y", "react"],
    priority: "high",
    status: "done",
  },
  {
    title: "Configure structured JSON telemetry for Next.js route handlers",
    description: "Standardize request latency, user agent hashes, and mutation response tags into structured output pipes.",
    tags: ["logging", "telemetry", "observability"],
    priority: "low",
    status: "backlog",
  },
  {
    title: "Migrate database connection pooling to Prisma accelerate",
    description: "Benchmark edge pool latency under concurrent write spikes and verify connection reclamation timeouts.",
    tags: ["database", "prisma", "scalability"],
    priority: "high",
    status: "backlog",
  },
  {
    title: "Refactor drag-and-drop lane reordering for mobile touchscreens",
    description: "Supply explicit action drop-sheets as touch-friendly alternatives to long-press drag operations.",
    tags: ["mobile", "ux", "dnd"],
    priority: "medium",
    status: "todo",
  },
  {
    title: "Add circuit breaker threshold to third-party webhook relays",
    description: "Gracefully queue outgoing webhooks into dead-letter storage when partner endpoints return 503 cascades.",
    tags: ["backend", "resilience", "webhooks"],
    priority: "urgent",
    status: "in_progress",
  },
  {
    title: "Review automated end-to-end coverage for filter query serialization",
    description: "Verify that multi-select filter combinations persist accurately across browser refresh and bookmarking.",
    tags: ["qa", "testing", "router"],
    priority: "medium",
    status: "done",
  },
  {
    title: "Standardize date-time serialization to ISO-8601 UTC across APIs",
    description: "Eliminate regional timezone drift in task due date comparison algorithms on client tables.",
    tags: ["api", "standards", "datetime"],
    priority: "low",
    status: "done",
  },
  {
    title: "Add rate-limiting tier for batch task assignment operations",
    description: "Throttle bulk reassignment updates to 30 requests per minute per tenant using sliding token buckets.",
    tags: ["security", "api", "rate-limiting"],
    priority: "high",
    status: "in_review",
  },
  {
    title: "Implement optimistic task status rollback on network dropouts",
    description: "Verify cache rollback snapshots revert accurately when mutation promises reject with error status codes.",
    tags: ["frontend", "tanstack-query", "reliability"],
    priority: "urgent",
    status: "in_progress",
  },
  {
    title: "Write seed benchmark script for 10000 synthetic task records",
    description: "Assess virtualized list rendering framerates and memory profiles under heavy task volumes.",
    tags: ["performance", "benchmarking", "virtualization"],
    priority: "low",
    status: "backlog",
  },
  {
    title: "Enhance empty state messaging for zero-match search filters",
    description: "Provide one-click reset action and recommended broader keyword phrases for filtered views.",
    tags: ["ux", "search", "polish"],
    priority: "low",
    status: "done",
  },
];

// Deterministic seed generator for 105 distinct tasks
function generateSeedTasks(): Task[] {
  const tasks: Task[] = [];
  const baseDate = new Date("2026-10-10T12:00:00Z");

  for (let i = 1; i <= 105; i++) {
    const template = TASK_TEMPLATES[(i - 1) % TASK_TEMPLATES.length];
    const assignee = SEEDED_ASSIGNEES[(i - 1) % SEEDED_ASSIGNEES.length];

    // Distribute statuses across the dataset
    const statusCycle: TaskStatus[] = [
      "backlog",
      "todo",
      "in_progress",
      "in_review",
      "done",
    ];
    const status = statusCycle[(i * 3) % statusCycle.length];

    // Distribute priorities
    const priorityCycle: TaskPriority[] = [
      "low",
      "medium",
      "high",
      "urgent",
    ];
    const priority = priorityCycle[(i * 7) % priorityCycle.length];

    const dueOffsetDays = ((i * 13) % 45) - 10;
    const dueDate = new Date(baseDate.getTime() + dueOffsetDays * 86400000)
      .toISOString()
      .split("T")[0];

    const createdOffsetDays = 30 + ((i * 5) % 30);
    const createdAt = new Date(baseDate.getTime() - createdOffsetDays * 86400000).toISOString();
    const updatedAt = new Date(baseDate.getTime() - ((i % 5) * 86400000)).toISOString();

    tasks.push({
      id: `task-${String(i).padStart(3, "0")}`,
      title: `${template.title} [Batch ${Math.ceil(i / 15)}]`,
      description: `${template.description} Tracked under milestone #${Math.ceil(i / 10)}. Target completion window: ${dueDate}.`,
      status,
      priority,
      assignee,
      tags: [...template.tags, `sprint-${Math.ceil(i / 20)}`],
      dueDate,
      createdAt,
      updatedAt,
    });
  }

  return tasks;
}

// In-memory global store across server module invocations
let globalTasks: Task[] = generateSeedTasks();

let globalSimulation: SimulationConfig = {
  failMutations: false,
  failReads: false,
  latencyMs: 300,
};

export function getTasksStore(): Task[] {
  return globalTasks;
}

export function resetTasksStore(): void {
  globalTasks = generateSeedTasks();
}

export function getSimulationConfig(): SimulationConfig {
  return { ...globalSimulation };
}

export function updateSimulationConfig(
  updates: Partial<SimulationConfig>
): SimulationConfig {
  globalSimulation = { ...globalSimulation, ...updates };
  return { ...globalSimulation };
}

export function queryTasks(params: TaskFilterParams): PaginatedTasksResponse {
  let filtered = [...globalTasks];

  // Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.assignee.name.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (params.status && params.status !== "all") {
    filtered = filtered.filter((t) => t.status === params.status);
  }

  // Priority filter
  if (params.priority && params.priority !== "all") {
    filtered = filtered.filter((t) => t.priority === params.priority);
  }

  // Assignee filter
  if (params.assigneeId && params.assigneeId !== "all") {
    filtered = filtered.filter((t) => t.assignee.id === params.assigneeId);
  }

  // Sorting
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "dueDate") {
      comparison = a.dueDate.localeCompare(b.dueDate);
    } else if (sortBy === "createdAt") {
      comparison = a.createdAt.localeCompare(b.createdAt);
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortBy === "priority") {
      const priorityWeight: Record<TaskPriority, number> = {
        low: 1,
        medium: 2,
        high: 3,
        urgent: 4,
      };
      comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate totals and facets
  const total = filtered.length;
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 20);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Pagination slice
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  // Facet counts based on current full filtered set
  const countsByStatus: Record<TaskStatus, number> = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
  };
  const countsByPriority: Record<TaskPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  filtered.forEach((t) => {
    countsByStatus[t.status] = (countsByStatus[t.status] || 0) + 1;
    countsByPriority[t.priority] = (countsByPriority[t.priority] || 0) + 1;
  });

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    countsByStatus,
    countsByPriority,
  };
}

export function createTaskRecord(
  data: Omit<Task, "id" | "createdAt" | "updatedAt">
): Task {
  const newId = `task-${String(globalTasks.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const newTask: Task = {
    ...data,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };
  globalTasks.unshift(newTask);
  return newTask;
}

export function updateTaskRecord(
  id: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>
): Task | null {
  const index = globalTasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = globalTasks[index];
  const updated: Task = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  globalTasks[index] = updated;
  return updated;
}

export function deleteTaskRecord(id: string): boolean {
  const index = globalTasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  globalTasks.splice(index, 1);
  return true;
}
