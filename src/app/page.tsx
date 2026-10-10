import { Suspense } from "react";
import DashboardView from "@/components/DashboardView";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
          Initializing workspace state...
        </div>
      }
    >
      <DashboardView />
    </Suspense>
  );
}
