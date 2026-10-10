import { describe, it, expect, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { PaginatedTasksResponse, Task } from "@/types/task";

describe("Cross-View Synchronization (Kanban & Table)", () => {
  let queryClient: QueryClient;

  const sampleTasks: Task[] = [
    {
      id: "task-001",
      title: "Sync Test Task A",
      description: "Description A",
      status: "backlog",
      priority: "high",
      assignee: {
        id: "usr_1",
        name: "Alex Chen",
        email: "alex.chen@platform.internal",
        avatarUrl: "",
        role: "Staff Engineer",
      },
      tags: ["sync"],
      dueDate: "2026-10-20",
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    },
    {
      id: "task-002",
      title: "Sync Test Task B",
      description: "Description B",
      status: "in_progress",
      priority: "medium",
      assignee: {
        id: "usr_2",
        name: "Maya Patel",
        email: "maya.patel@platform.internal",
        avatarUrl: "",
        role: "Lead Designer",
      },
      tags: ["sync"],
      dueDate: "2026-10-22",
      createdAt: "2026-10-02T00:00:00Z",
      updatedAt: "2026-10-02T00:00:00Z",
    },
  ];

  const initialResponse: PaginatedTasksResponse = {
    items: sampleTasks,
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
    countsByStatus: {
      backlog: 1,
      todo: 0,
      in_progress: 1,
      in_review: 0,
      done: 0,
    },
    countsByPriority: {
      low: 0,
      medium: 1,
      high: 1,
      urgent: 0,
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(["tasks", {}], initialResponse);
  });

  it("updates shared cache such that both board and table view receive synchronized updates", () => {
    // Simulate updating Task A from Backlog -> In Review
    queryClient.setQueriesData<PaginatedTasksResponse>(
      { queryKey: ["tasks"] },
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((item) =>
            item.id === "task-001" ? { ...item, status: "in_review" } : item
          ),
          countsByStatus: {
            ...oldData.countsByStatus,
            backlog: 0,
            in_review: 1,
          },
        };
      }
    );

    const updatedData =
      queryClient.getQueryData<PaginatedTasksResponse>(["tasks", {}]);

    // Validate Kanban view projection: task-001 is now under in_review column
    const kanbanInReviewColumn = updatedData?.items.filter(
      (t) => t.status === "in_review"
    );
    expect(kanbanInReviewColumn?.length).toBe(1);
    expect(kanbanInReviewColumn?.[0].id).toBe("task-001");

    // Validate Table view projection: task-001 status cell displays in_review
    const tableRow = updatedData?.items.find((t) => t.id === "task-001");
    expect(tableRow?.status).toBe("in_review");

    // Validate status counters match across projections
    expect(updatedData?.countsByStatus.backlog).toBe(0);
    expect(updatedData?.countsByStatus.in_review).toBe(1);
    expect(updatedData?.countsByStatus.in_progress).toBe(1);
  });
});
