"use client";

import { useEffect, useState } from "react";

export function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedValue = sessionStorage.getItem(key);
      if (savedValue) setValue(JSON.parse(savedValue) as T);
    } catch {
      sessionStorage.removeItem(key);
    } finally {
      setReady(true);
    }
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // O portal continua funcionando quando o armazenamento não está disponível.
    }
  }, [key, ready, value]);

  return [value, setValue] as const;
}
