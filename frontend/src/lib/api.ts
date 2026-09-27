import type {
  AcademicStructure,
  ClassGroup,
  Countdown,
  Course,
  PasswordResetRequest,
  PortalNotification,
  ScheduleItem,
  SchoolEvent,
  SchoolGrade,
  Suggestion,
  SuggestionStatus,
  User,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const TOKEN_KEY = "portal-ete-token";

function clearPortalOperationalData(storage: Storage) {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (
      key?.startsWith("ete-") ||
      key?.startsWith("portal-ete-notificacoes-lidas")
    ) {
      storage.removeItem(key);
    }
  }
}

function token() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Não foi possível acessar o servidor.");
  }
  return response.json() as Promise<T>;
}

export interface Session {
  accessToken: string;
  user: User;
}

export const api = {
  clearLegacyLocalCache() {
    clearPortalOperationalData(localStorage);
  },

  login: (email: string, password: string) =>
    request<Session>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    authorizationCode?: string;
    courseId?: string;
    gradeId?: string;
    classGroupId?: string;
    curso?: string;
    serie?: string;
    turma?: string;
  }) =>
    request<Session>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>("/auth/me"),

  updateProfile: (data: {
    name?: string;
    courseId?: string;
    gradeId?: string;
    classGroupId?: string;
    curso?: string;
    serie?: string;
    turma?: string;
  }) =>
    request<User>("/auth/perfil", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  academicStructure: () => request<AcademicStructure>("/academic/structure"),

  resetPasswordWithCode: (email: string, code: string, newPassword: string) =>
    request<{ success: boolean; message: string }>(
      "/auth/recuperacao/redefinir",
      {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
      },
    ),

  requestPasswordReset: (email: string, reason?: string) =>
    request<{ success: boolean; message: string }>(
      "/auth/recuperacao/solicitacoes",
      {
        method: "POST",
        body: JSON.stringify({ email, reason }),
      },
    ),

  passwordResetRequests: () =>
    request<PasswordResetRequest[]>("/auth/recuperacao/solicitacoes"),

  approvePasswordReset: (id: string) =>
    request<{
      success: boolean;
      code: string;
      expiresAt: string;
      user: { name: string; email: string };
    }>(`/auth/recuperacao/solicitacoes/${id}/aprovar`, { method: "PATCH" }),

  storeSession(session: Session, remember: boolean) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, session.accessToken);
    storage.setItem("portal-ete-session", JSON.stringify(session.user));
    if (remember)
      localStorage.setItem("portal-ete-user", JSON.stringify(session.user));
  },

  clearSession() {
    for (const storage of [sessionStorage, localStorage]) {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem("portal-ete-session");

      clearPortalOperationalData(storage);
    }
    localStorage.removeItem("portal-ete-user");
  },

  events: () => request<SchoolEvent[]>("/events"),
  createEvent: (data: Omit<SchoolEvent, "id">) =>
    request<SchoolEvent>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteEvent: (id: string) => request(`/events/${id}`, { method: "DELETE" }),

  schedules: () => request<ScheduleItem[]>("/schedules"),
  createSchedule: (data: Omit<ScheduleItem, "id">) =>
    request<ScheduleItem>("/schedules", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSchedule: (id: string) =>
    request(`/schedules/${id}`, { method: "DELETE" }),

  notifications: () => request<PortalNotification[]>("/notifications"),
  notificationUnreadCount: () =>
    request<{ count: number }>("/notifications/unread-count"),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean; count: number }>("/notifications/read-all", {
      method: "PATCH",
    }),

  countdowns: () => request<Countdown[]>("/countdowns"),
  createCountdown: (data: Omit<Countdown, "id">) =>
    request<Countdown>("/countdowns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCountdown: (id: string) =>
    request(`/countdowns/${id}`, { method: "DELETE" }),

  suggestions: () => request<Suggestion[]>("/suggestions"),
  createSuggestion: (data: Omit<Suggestion, "id" | "createdAt" | "status">) =>
    request<Suggestion>("/suggestions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSuggestionStatus: (id: string, status: SuggestionStatus) =>
    request<Suggestion>(`/suggestions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteSuggestion: (id: string) =>
    request<{ success: boolean }>(`/suggestions/${id}`, { method: "DELETE" }),
};
