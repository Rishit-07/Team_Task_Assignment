import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeSync from "@/components/providers/ThemeSync";

export const metadata: Metadata = {
  title: "Team Task Dashboard",
  description:
    "Engineering task dashboard featuring optimistic updates, rollback resilience, and synchronized Kanban board.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('task-dashboard-preferences-v1');
                if (stored) {
                  var parsed = JSON.parse(stored);
                  if (parsed && parsed.state && parsed.state.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#f6f8f7] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
        <QueryProvider>
          <ThemeSync />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
