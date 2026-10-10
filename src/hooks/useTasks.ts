"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTaskApi,
  deleteTaskApi,
  fetchAssignees,
  fetchTasks,
  updateTaskApi,
} from "@/lib/api";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import {
  PaginatedTasksResponse,
  Task,
  TaskFilterParams,
} from "@/types/task";

export function useTasks(filters: TaskFilterParams = {}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchTasks(filters),
  });
}

export function useAssignees() {
  return useQuery({
    queryKey: ["assignees"],
    queryFn: fetchAssignees,
    staleTime: 1000 * 60 * 10,
  });
}

interface UpdateTaskVariables {
  id: string;
  updates: Partial<Task>;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const failMutations = usePreferencesStore((state) => state.failMutations);
  const showToast = usePreferencesStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ id, updates }: UpdateTaskVariables) =>
      updateTaskApi(id, updates, failMutations),

    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot all existing query caches matching ['tasks']
      const previousQueries = queryClient.getQueriesData<PaginatedTasksResponse>({
        queryKey: ["tasks"],
      });

      // Optimistically update every cached page/filter list
      queryClient.setQueriesData<PaginatedTasksResponse>(
        { queryKey: ["tasks"] },
        (oldData) => {
          if (!oldData) return oldData;

          const updatedItems = oldData.items.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
            return item;
          });

          // Recompute facet counts if status or priority changed
          const newStatusCounts = { ...oldData.countsByStatus };
          const newPriorityCounts = { ...oldData.countsByPriority };

          const originalItem = oldData.items.find((item) => item.id === id);
          if (originalItem && updates.status && originalItem.status !== updates.status) {
            newStatusCounts[originalItem.status] = Math.max(
              0,
              (newStatusCounts[originalItem.status] || 1) - 1
            );
            newStatusCounts[updates.status] =
              (newStatusCounts[updates.status] || 0) + 1;
          }

          if (
            originalItem &&
            updates.priority &&
            originalItem.priority !== updates.priority
          ) {
            newPriorityCounts[originalItem.priority] = Math.max(
              0,
              (newPriorityCounts[originalItem.priority] || 1) - 1
            );
            newPriorityCounts[updates.priority] =
              (newPriorityCounts[updates.priority] || 0) + 1;
          }

          return {
            ...oldData,
            items: updatedItems,
            countsByStatus: newStatusCounts,
            countsByPriority: newPriorityCounts,
          };
        }
      );

      // Return context with snapshots for rollback
      return { previousQueries };
    },

    onError: (error, variables, context) => {
      // Revert every cached query to its prior snapshot
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }

      showToast({
        title: "Update Reverted",
        description: error.message || "Simulated network failure. Task restored to prior state.",
        type: "rollback",
      });
    },

    onSettled: () => {
      // Sync cache with backend state
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const failMutations = usePreferencesStore((state) => state.failMutations);
  const showToast = usePreferencesStore((state) => state.showToast);

  return useMutation({
    mutationFn: (newTask: {
      title: string;
      description: string;
      status: string;
      priority: string;
      assigneeId: string;
      dueDate: string;
      tags: string[];
    }) => createTaskApi(newTask, failMutations),

    onError: (error) => {
      showToast({
        title: "Creation Failed",
        description: error.message || "Could not create task.",
        type: "error",
      });
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast({
        title: "Task Created",
        description: `Successfully added "${data.title}"`,
        type: "success",
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const failMutations = usePreferencesStore((state) => state.failMutations);
  const showToast = usePreferencesStore((state) => state.showToast);

  return useMutation({
    mutationFn: (id: string) => deleteTaskApi(id, failMutations),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousQueries = queryClient.getQueriesData<PaginatedTasksResponse>({
        queryKey: ["tasks"],
      });

      queryClient.setQueriesData<PaginatedTasksResponse>(
        { queryKey: ["tasks"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            total: Math.max(0, oldData.total - 1),
            items: oldData.items.filter((item) => item.id !== id),
          };
        }
      );

      return { previousQueries };
    },

    onError: (error, id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }

      showToast({
        title: "Deletion Failed",
        description: error.message || "Simulated network failure. Task restored.",
        type: "rollback",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
