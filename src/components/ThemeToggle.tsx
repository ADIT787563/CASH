"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Use a single source of truth for the initial theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    let initialTheme: "light" | "dark";

    if (savedTheme) {
      initialTheme = savedTheme;
    } else {
      initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    // Also set data-theme attribute for CSS targeting if needed
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.documentElement.setAttribute("data-theme", newTheme);

    // Dispatch a custom event to notify other components if necessary
    window.dispatchEvent(new Event("themechange"));
  };

  // Prevent hydration mismatch by rendering a placeholder of the same size
  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-transparent w-9 h-9" aria-hidden="true" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-muted transition-all duration-200 active:scale-90"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-600 hover:text-indigo-600 transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400 hover:text-amber-500 transition-colors" />
      )}
    </button>
  );
};
