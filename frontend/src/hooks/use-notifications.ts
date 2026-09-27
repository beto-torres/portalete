"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { PortalNotification } from "@/types";

const REFRESH_INTERVAL_MS = 30_000;

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const nextNotifications = await api.notifications();
      setNotifications(nextNotifications);
    } catch {
      // Mantém a interface disponível durante uma indisponibilidade temporária.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setNotifications([]);
    setLoading(true);
    void refresh();

    const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    const refreshOnFocus = () => void refresh();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [refresh, userId]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  async function markAsRead(id: string) {
    await api.markNotificationRead(id);
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, readAt } : notification,
      ),
    );
  }

  async function markAllAsRead() {
    await api.markAllNotificationsRead();
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt },
      ),
    );
  }

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
