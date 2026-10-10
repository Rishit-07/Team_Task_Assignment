import { NextRequest, NextResponse } from "next/server";
import {
  deleteTaskRecord,
  getSimulationConfig,
  getTasksStore,
  SEEDED_ASSIGNEES,
  updateTaskRecord,
} from "@/lib/mockData";
import { TaskPriority, TaskStatus } from "@/types/task";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sim = getSimulationConfig();
  if (sim.latencyMs > 0) await delay(sim.latencyMs);

  const task = getTasksStore().find((t) => t.id === params.id);
  if (!task) {
    return NextResponse.json(
      { error: "Not Found", message: `Task ${params.id} does not exist.` },
      { status: 404 }
    );
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sim = getSimulationConfig();
  if (sim.latencyMs > 0) await delay(sim.latencyMs);

  // Failure simulation trigger
  const forceErrorHeader = request.headers.get("x-simulate-error") === "true";
  if (sim.failMutations || forceErrorHeader) {
    return NextResponse.json(
      {
        error: "Simulated Mutation Failure",
        message: `Status update for ${params.id} intentionally failed to test optimistic rollback.`,
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.status !== undefined) updates.status = body.status as TaskStatus;
    if (body.priority !== undefined) updates.priority = body.priority as TaskPriority;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
    if (body.tags !== undefined) updates.tags = body.tags;

    if (body.assigneeId !== undefined) {
      const match = SEEDED_ASSIGNEES.find((a) => a.id === body.assigneeId);
      if (match) updates.assignee = match;
    }

    const updated = updateTaskRecord(params.id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Not Found", message: `Task ${params.id} does not exist.` },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid JSON format." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sim = getSimulationConfig();
  if (sim.latencyMs > 0) await delay(sim.latencyMs);

  const forceErrorHeader = request.headers.get("x-simulate-error") === "true";
  if (sim.failMutations || forceErrorHeader) {
    return NextResponse.json(
      {
        error: "Simulated Deletion Failure",
        message: `Deletion of ${params.id} failed as part of simulation testing.`,
      },
      { status: 500 }
    );
  }

  const success = deleteTaskRecord(params.id);
  if (!success) {
    return NextResponse.json(
      { error: "Not Found", message: `Task ${params.id} does not exist.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, id: params.id });
}
