import { describe, it, expect, beforeEach } from "vitest";
import { queryTasks, resetTasksStore, SEEDED_ASSIGNEES } from "@/lib/mockData";

describe("Combined Filters and Query Engine", () => {
  beforeEach(() => {
    resetTasksStore();
  });

  it("returns all 105 seeded tasks by default with initial pagination", () => {
    const result = queryTasks({ page: 1, limit: 20 });
    expect(result.total).toBe(105);
    expect(result.items.length).toBe(20);
    expect(result.totalPages).toBe(6);
  });

  it("filters accurately by status", () => {
    const result = queryTasks({ status: "in_progress", limit: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((t) => t.status === "in_progress")).toBe(true);
  });

  it("filters accurately by priority", () => {
    const result = queryTasks({ priority: "urgent", limit: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((t) => t.priority === "urgent")).toBe(true);
  });

  it("filters accurately by assignee ID", () => {
    const targetAssignee = SEEDED_ASSIGNEES[0];
    const result = queryTasks({ assigneeId: targetAssignee.id, limit: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(
      result.items.every((t) => t.assignee.id === targetAssignee.id)
    ).toBe(true);
  });

  it("combines search, status, and priority simultaneously", () => {
    const result = queryTasks({
      search: "redis",
      status: "in_progress",
      priority: "high",
    });

    expect(
      result.items.every(
        (t) =>
          t.status === "in_progress" &&
          t.priority === "high" &&
          (t.title.toLowerCase().includes("redis") ||
            t.description.toLowerCase().includes("redis") ||
            t.tags.includes("redis"))
      )
    ).toBe(true);
  });

  it("sorts tasks by priority in descending order", () => {
    const result = queryTasks({ sortBy: "priority", sortOrder: "desc", limit: 50 });
    const priorityValues: Record<string, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    for (let i = 0; i < result.items.length - 1; i++) {
      const current = priorityValues[result.items[i].priority];
      const next = priorityValues[result.items[i + 1].priority];
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("calculates facet counts accurately for matching filtered subsets", () => {
    const result = queryTasks({ status: "done", limit: 100 });
    const computedTotal =
      result.countsByStatus.backlog +
      result.countsByStatus.todo +
      result.countsByStatus.in_progress +
      result.countsByStatus.in_review +
      result.countsByStatus.done;

    expect(computedTotal).toBe(result.total);
    expect(result.countsByStatus.done).toBe(result.total);
    expect(result.countsByStatus.todo).toBe(0);
  });
});
