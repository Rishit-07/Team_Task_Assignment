"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/store/usePreferencesStore";

export default function ThemeSync() {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  return null;
}
