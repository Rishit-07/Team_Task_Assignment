import {
  Assignee,
  PaginatedTasksResponse,
  Task,
  TaskFilterParams,
} from "@/types/task";

export async function fetchTasks(
  params: TaskFilterParams = {}
): Promise<PaginatedTasksResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.priority && params.priority !== "all")
    searchParams.set("priority", params.priority);
  if (params.assigneeId && params.assigneeId !== "all")
    searchParams.set("assigneeId", params.assigneeId);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(`/api/tasks?${searchParams.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch task records.");
  }
  return response.json();
}

export async function fetchAssignees(): Promise<Assignee[]> {
  const response = await fetch("/api/assignees");
  if (!response.ok) {
    throw new Error("Failed to fetch assignees list.");
  }
  return response.json();
}

export async function updateTaskApi(
  id: string,
  updates: Partial<Task>,
  simulateError = false
): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(simulateError ? { "x-simulate-error": "true" } : {}),
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Operation failed with status ${response.status}. Reverting state.`
    );
  }

  return response.json();
}

export async function createTaskApi(
  newTask: {
    title: string;
    description: string;
    status: string;
    priority: string;
    assigneeId: string;
    dueDate: string;
    tags: string[];
  },
  simulateError = false
): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(simulateError ? { "x-simulate-error": "true" } : {}),
    },
    body: JSON.stringify(newTask),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create task.");
  }

  return response.json();
}

export async function deleteTaskApi(
  id: string,
  simulateError = false
): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(simulateError ? { "x-simulate-error": "true" } : {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete task ${id}.`);
  }

  return response.json();
}
