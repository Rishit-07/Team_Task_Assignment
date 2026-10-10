import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "NovaBoard Mobile & Core Engine | Sprint 28",
  description:
    "Engineering sprint task dashboard featuring optimistic updates, rollback resilience, and synchronized Kanban board.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-[#f6f8f7] text-slate-800 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
