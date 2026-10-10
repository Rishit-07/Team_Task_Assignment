export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Assignee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Assignee;
  tags: string[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilterParams {
  search?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  assigneeId?: string | "all";
  sortBy?: "title" | "dueDate" | "priority" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedTasksResponse {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  countsByStatus: Record<TaskStatus, number>;
  countsByPriority: Record<TaskPriority, number>;
}

export interface SimulationConfig {
  failMutations: boolean;
  failReads: boolean;
  latencyMs: number;
}
