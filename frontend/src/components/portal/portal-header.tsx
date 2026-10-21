"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, CheckCheck, Clock3, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useTheme } from "@/hooks/use-theme";
import { roleNames } from "@/lib/data";
import { obterPrimeiroNome } from "@/lib/nome-usuario";
import type { User, View } from "@/types";

const baseItems: Array<{ label: string; detail: string; view: View }> = [
  { label: "Início", detail: "Visão geral do portal", view: "inicio" },
  { label: "Meu perfil", detail: "Dados da conta", view: "perfil" },
  { label: "Horários", detail: "Grade de aulas", view: "horarios" },
  { label: "Calendário", detail: "Calendário escolar", view: "calendario" },
  { label: "Eventos", detail: "Mural da escola", view: "eventos" },
];

export function PortalHeader({ user, onOpenMenu, onNavigate }: {
  user: User;
  onOpenMenu: () => void;
  onNavigate: (view: View) => void;
}) {
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(user.id ?? user.email);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [notificationsOpen]);

  const items = [
    ...baseItems,
    ...(user.role === "aluno"
      ? [{ label: "Sugestões", detail: "Enviar uma ideia", view: "sugestoes" as View }]
      : []),
    ...(user.role !== "aluno"
      ? [{ label: "Administração", detail: "Gerenciar o portal", view: "admin" as View }]
      : []),
  ];
  const results = search.trim()
    ? items.filter((item) => `${item.label} ${item.detail}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")))
    : [];

  async function openNotification(id: string, type: "evento" | "horario") {
    await markAsRead(id);
    onNavigate(type === "evento" ? "eventos" : "horarios");
    setNotificationsOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 bg-ink/80 px-4 backdrop-blur-xl sm:px-7">
      <button className="icon-button lg:hidden" onClick={onOpenMenu} aria-label="Abrir menu"><Menu /></button>
      <div className="relative hidden max-w-md flex-1 sm:block">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4">
          <Search size={18} className="text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600" placeholder="Ir para uma área do portal..." aria-label="Pesquisar áreas do portal" />
          {search && <button onClick={() => setSearch("")} aria-label="Limpar pesquisa"><X size={16} /></button>}
        </div>
        {search && <div className="header-popover left-0 right-0">
          {results.length ? results.map((item) => <button key={item.view} onClick={() => { onNavigate(item.view); setSearch(""); }}><strong>{item.label}</strong><span>{item.detail}</span></button>) : <p>Nenhuma área encontrada.</p>}
        </div>}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button className="icon-button" onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}>{theme === "dark" ? <Sun /> : <Moon />}</button>
        <div className="relative" ref={notificationsRef}>
          <button className="icon-button relative" onClick={() => setNotificationsOpen((current) => !current)} aria-expanded={notificationsOpen} aria-label="Notificações" title={unreadCount ? `${unreadCount} nova(s) notificação(ões)` : "Notificações"}>
            <Bell />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>
          {notificationsOpen && <div className="header-popover right-0 w-80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-3">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-semibold text-slate-200">Notificações</strong>
                {unreadCount === 0 && <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400"><CheckCheck size={12} /> Lidas</span>}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && <button type="button" onClick={() => void markAllAsRead()} className="text-xs text-primary hover:underline">Marcar todas como lidas</button>}
                <button onClick={() => setNotificationsOpen(false)} aria-label="Fechar" className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length ? notifications.map((notification) => {
                const read = Boolean(notification.readAt);
                const Icon = notification.type === "evento" ? CalendarDays : Clock3;
                return <button key={notification.id} onClick={() => void openNotification(notification.id, notification.type)} className={`flex w-full items-start gap-3 border-b border-white/5 p-3 text-left transition hover:bg-white/5 ${!read ? "bg-primary/5" : ""}`}>
                  <Icon size={17} className={`mt-0.5 flex-shrink-0 ${!read ? "text-primary" : "text-slate-400"}`} />
                  <span className="min-w-0 flex-1"><strong className={`block truncate text-sm ${!read ? "font-semibold text-slate-100" : "font-normal text-slate-300"}`}>{notification.title}</strong><small className="block text-xs text-slate-400">{notification.message}</small></span>
                </button>;
              }) : <p className="p-4 text-center text-sm text-slate-500">Nenhuma notificação disponível.</p>}
            </div>
          </div>}
        </div>
        <button onClick={() => onNavigate("perfil")} className="ml-2 flex items-center gap-3 rounded-xl p-1.5 pr-3 text-left transition hover:bg-white/5">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-bold text-white">{user.name[0]?.toUpperCase()}</span>
          <span className="hidden sm:block"><strong className="block text-sm capitalize">{obterPrimeiroNome(user.name)}</strong><small className="text-slate-500">{roleNames[user.role]}</small></span>
        </button>
      </div>
    </header>
  );
}
