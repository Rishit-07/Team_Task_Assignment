import { NextRequest, NextResponse } from "next/server";
import {
  createTaskRecord,
  getSimulationConfig,
  queryTasks,
  SEEDED_ASSIGNEES,
} from "@/lib/mockData";
import { TaskFilterParams, TaskPriority, TaskStatus } from "@/types/task";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const sim = getSimulationConfig();

  // Simulate artificial delay if configured
  const latency = sim.latencyMs;
  if (latency > 0) {
    await delay(latency);
  }

  // Check read failure simulation
  const forceErrorHeader = request.headers.get("x-simulate-error") === "true";
  if (sim.failReads || forceErrorHeader) {
    return NextResponse.json(
      {
        error: "Simulated API Read Failure",
        message: "Induced read error for chaos and retry verification.",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);

  const params: TaskFilterParams = {
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as TaskStatus | "all") || "all",
    priority: (searchParams.get("priority") as TaskPriority | "all") || "all",
    assigneeId: searchParams.get("assigneeId") || "all",
    sortBy:
      (searchParams.get("sortBy") as
        | "title"
        | "dueDate"
        | "priority"
        | "createdAt"
        | "status") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    page: searchParams.has("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1,
    limit: searchParams.has("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20,
  };

  const response = queryTasks(params);
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const sim = getSimulationConfig();

  if (sim.latencyMs > 0) {
    await delay(sim.latencyMs);
  }

  const forceErrorHeader = request.headers.get("x-simulate-error") === "true";
  if (sim.failMutations || forceErrorHeader) {
    return NextResponse.json(
      {
        error: "Simulated Mutation Failure",
        message:
          "The task creation request was rejected to test optimistic rollback.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Validation Error", message: "Task title is required." },
        { status: 400 }
      );
    }

    const assignee =
      SEEDED_ASSIGNEES.find((a) => a.id === body.assigneeId) ||
      SEEDED_ASSIGNEES[0];

    const newTask = createTaskRecord({
      title: body.title.trim(),
      description: body.description?.trim() || "No additional description provided.",
      status: (body.status as TaskStatus) || "todo",
      priority: (body.priority as TaskPriority) || "medium",
      assignee,
      tags: Array.isArray(body.tags) ? body.tags : ["general"],
      dueDate: body.dueDate || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid payload format." },
      { status: 400 }
    );
  }
}
