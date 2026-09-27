"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Role, User } from "@/types";

function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<User>;
  return (
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    ["aluno", "professor", "admin"].includes(user.role ?? "")
  );
}

export function useSession() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      api.clearLegacyLocalCache();
      const saved =
        sessionStorage.getItem("portal-ete-session") ??
        localStorage.getItem("portal-ete-user");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isUser(parsed)) setUser(parsed);
        else clearSavedUser();
      }
    } catch {
      clearSavedUser();
    } finally {
      setReady(true);
    }
  }, []);

  async function login(email: string, password: string, remember: boolean) {
    const session = await api.login(email, password);
    setUser(session.user);
    try {
      api.storeSession(session, remember);
    } catch {
      /* Sessão válida apenas nesta tela. */
    }
    router.push("/portal");
  }

  async function register(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    authorizationCode?: string;
    curso?: string;
    serie?: string;
    turma?: string;
    courseId?: string;
    gradeId?: string;
    classGroupId?: string;
  }) {
    await api.register(data);
  }

  function updateUser(nextUser: User) {
    setUser(nextUser);
    try {
      sessionStorage.setItem("portal-ete-session", JSON.stringify(nextUser));
      if (localStorage.getItem("portal-ete-user"))
        localStorage.setItem("portal-ete-user", JSON.stringify(nextUser));
    } catch {
      /* Mantém a atualização apenas em memória. */
    }
  }

  function logout() {
    setUser(null);
    try {
      api.clearSession();
    } catch {
      /* A navegação continua mesmo sem acesso ao armazenamento. */
    }
    router.push("/");
  }

  return { user, ready, login, register, updateUser, logout };
}

function clearSavedUser() {
  try {
    sessionStorage.removeItem("portal-ete-session");
    localStorage.removeItem("portal-ete-user");
  } catch {
    // Nada precisa ser feito quando o navegador bloqueia o armazenamento.
  }
}
