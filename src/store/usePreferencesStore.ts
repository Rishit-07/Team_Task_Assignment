import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "kanban" | "table";
export type ThemeMode = "light" | "dark";

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: "success" | "error" | "info" | "rollback";
}

interface PreferencesState {
  theme: ThemeMode;
  viewMode: ViewMode;
  failMutations: boolean;
  latencyMs: number;
  toast: ToastMessage | null;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setViewMode: (mode: ViewMode) => void;
  setFailMutations: (fail: boolean) => void;
  setLatencyMs: (ms: number) => void;
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "dark",
      viewMode: "kanban",
      failMutations: false,
      latencyMs: 300,
      toast: null,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setViewMode: (viewMode) => set({ viewMode }),
      setFailMutations: (failMutations) => set({ failMutations }),
      setLatencyMs: (latencyMs) => set({ latencyMs }),
      showToast: (toast) =>
        set({
          toast: {
            ...toast,
            id: Math.random().toString(36).substring(2, 9),
          },
        }),
      dismissToast: () => set({ toast: null }),
    }),
    {
      name: "task-dashboard-preferences-v1",
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        failMutations: state.failMutations,
        latencyMs: state.latencyMs,
      }),
    }
  )
);
