import { describe, it, expect, beforeEach, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { PaginatedTasksResponse, Task } from "@/types/task";
import { usePreferencesStore } from "@/store/usePreferencesStore";

describe("Optimistic Updates with Failure Rollback", () => {
  let queryClient: QueryClient;

  const initialTask: Task = {
    id: "task-001",
    title: "Initial Task State",
    description: "Initial description",
    status: "todo",
    priority: "medium",
    assignee: {
      id: "usr_1",
      name: "Alex Chen",
      email: "alex.chen@platform.internal",
      avatarUrl: "https://example.com/avatar.jpg",
      role: "Staff Engineer",
    },
    tags: ["infra"],
    dueDate: "2026-10-15",
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  };

  const initialResponse: PaginatedTasksResponse = {
    items: [initialTask],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    countsByStatus: {
      backlog: 0,
      todo: 1,
      in_progress: 0,
      in_review: 0,
      done: 0,
    },
    countsByPriority: {
      low: 0,
      medium: 1,
      high: 0,
      urgent: 0,
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(["tasks", {}], initialResponse);
    usePreferencesStore.setState({
      failMutations: true,
      toast: null,
    });
  });

  it("optimistically mutates cache then cleanly rolls back on mutation error", async () => {
    const queryKey = ["tasks", {}];

    // Snapshot before mutation
    const previousQueries = queryClient.getQueriesData<PaginatedTasksResponse>({
      queryKey: ["tasks"],
    });

    // 1. Optimistic Update step
    queryClient.setQueriesData<PaginatedTasksResponse>(
      { queryKey: ["tasks"] },
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((item) =>
            item.id === "task-001" ? { ...item, status: "done" } : item
          ),
          countsByStatus: {
            ...oldData.countsByStatus,
            todo: 0,
            done: 1,
          },
        };
      }
    );

    // Verify cache has optimistically transitioned to "done"
    const optimisticCache =
      queryClient.getQueryData<PaginatedTasksResponse>(queryKey);
    expect(optimisticCache?.items[0].status).toBe("done");
    expect(optimisticCache?.countsByStatus.done).toBe(1);
    expect(optimisticCache?.countsByStatus.todo).toBe(0);

    // 2. Simulate API mutation failure triggering rollback in onError
    const simulatedError = new Error("Simulated 500 Network Outage");

    // Perform rollback restoration
    previousQueries.forEach(([k, previousData]) => {
      queryClient.setQueryData(k, previousData);
    });

    usePreferencesStore.getState().showToast({
      title: "Update Reverted",
      description: simulatedError.message,
      type: "rollback",
    });

    // 3. Verify cache is completely reverted to initial state
    const revertedCache =
      queryClient.getQueryData<PaginatedTasksResponse>(queryKey);
    expect(revertedCache?.items[0].status).toBe("todo");
    expect(revertedCache?.countsByStatus.todo).toBe(1);
    expect(revertedCache?.countsByStatus.done).toBe(0);

    // 4. Verify user was notified of the rollback
    const activeToast = usePreferencesStore.getState().toast;
    expect(activeToast).not.toBeNull();
    expect(activeToast?.type).toBe("rollback");
    expect(activeToast?.title).toBe("Update Reverted");
  });
});
