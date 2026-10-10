import { Suspense } from "react";
import DashboardView from "@/components/DashboardView";
import { queryTasks, SEEDED_ASSIGNEES } from "@/lib/mockData";
import { TaskPriority, TaskStatus } from "@/types/task";

export default function HomePage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  };
}) {
  // Compute initial tasks dataset on the server in 0ms
  const initialData = queryTasks({
    search: searchParams?.search,
    status: (searchParams?.status as TaskStatus | "all") || "all",
    priority: (searchParams?.priority as TaskPriority | "all") || "all",
    assigneeId: searchParams?.assigneeId || "all",
    sortBy: (searchParams?.sortBy as any) || "createdAt",
    sortOrder: (searchParams?.sortOrder as any) || "desc",
    page: searchParams?.page ? Number(searchParams?.page) : 1,
    limit: 105,
  });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
          Loading workspace...
        </div>
      }
    >
      <DashboardView
        initialTasks={initialData}
        initialAssignees={SEEDED_ASSIGNEES}
      />
    </Suspense>
  );
}
