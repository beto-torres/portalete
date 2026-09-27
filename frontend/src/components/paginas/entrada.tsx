"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { AuthScreen } from "../auth-screen";
import { LoadingScreen } from "../portal/loading-screen";
import { StatusScreen } from "../portal/status-screen";

export function PaginaEntrada() {
  const router = useRouter();
  const session = useSession();
  if (!session.ready) return <LoadingScreen />;
  if (!session.user)
    return <AuthScreen onLogin={session.login} onRegister={session.register} />;
  return (
    <StatusScreen
      title="Sessão encontrada"
      text="Você já está conectado ao Portal ETE."
      action="Entrar no portal"
      onAction={() => router.push("/portal")}
    />
  );
}
