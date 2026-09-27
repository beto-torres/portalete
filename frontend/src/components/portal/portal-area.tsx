"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { View } from "@/types";
import { usePortalData } from "@/hooks/use-portal-data";
import { useSession } from "@/hooks/use-session";
import { PortalProvider } from "@/contexts/portal-context";
import { AuthScreen } from "../auth-screen";
import { LoadingScreen } from "./loading-screen";
import { PortalLayout } from "./portal-layout";
import { StatusScreen } from "./status-screen";

const routes: Record<View, string> = {
  inicio: "/portal",
  perfil: "/portal/perfil",
  horarios: "/portal/horarios",
  calendario: "/portal/calendario",
  eventos: "/portal/eventos",
  sugestoes: "/portal/sugestoes",
  admin: "/portal/admin",
};
const paths: Record<string, View> = {
  "/portal": "inicio",
  "/portal/perfil": "perfil",
  "/portal/horarios": "horarios",
  "/portal/calendario": "calendario",
  "/portal/eventos": "eventos",
  "/portal/sugestoes": "sugestoes",
  "/portal/admin": "admin",
};

export function PortalArea({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const data = usePortalData(session.user, session.ready);
  const view = paths[pathname] ?? "inicio";
  const navigate = (nextView: View) => router.push(routes[nextView]);

  if (!session.ready) return <LoadingScreen />;
  if (!session.user)
    return <AuthScreen onLogin={session.login} onRegister={session.register} />;
  if (view === "admin" && session.user.role === "aluno")
    return (
      <StatusScreen
        title="Área restrita"
        text="A administração está disponível apenas para professores e administradores."
        action="Voltar ao início"
        onAction={() => navigate("inicio")}
      />
    );
  if (view === "sugestoes" && session.user.role !== "aluno")
    return (
      <StatusScreen
        title="Área do estudante"
        text="O envio de sugestões está disponível no perfil de aluno."
        action="Voltar ao seu painel"
        onAction={() => navigate("inicio")}
      />
    );

  const context = {
    user: session.user,
    events: data.events,
    setEvents: data.setEvents,
    countdowns: data.countdowns,
    setCountdowns: data.setCountdowns,
    suggestions: data.suggestions,
    setSuggestions: data.setSuggestions,
    schedule: data.schedule,
    setSchedule: data.setSchedule,
    navigate,
    updateUser: session.updateUser,
  };
  return (
    <PortalProvider value={context}>
      <PortalLayout
        user={session.user}
        view={view}
        warning={data.warning}
        onNavigate={navigate}
        onLogout={session.logout}
      >
        {children}
      </PortalLayout>
    </PortalProvider>
  );
}
