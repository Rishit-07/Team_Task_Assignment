import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Team Task Dashboard | Workspace Operations",
  description:
    "High-performance engineering task dashboard featuring optimistic state management, synchronized Kanban and tabular views, and chaos testing controls.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
