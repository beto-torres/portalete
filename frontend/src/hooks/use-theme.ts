"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("portal-ete-theme");
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    } catch { /* Usa o tema escuro padrão. */ }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try { localStorage.setItem("portal-ete-theme", theme); } catch { /* Mantém o tema apenas em memória. */ }
  }, [theme]);

  function toggleTheme() {
    setTheme(current => current === "dark" ? "light" : "dark");
  }

  return { theme, toggleTheme };
}
