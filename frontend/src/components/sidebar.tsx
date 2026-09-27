"use client";

import { CalendarDays, Clock3, GraduationCap, Images, LayoutDashboard, Lightbulb, LogOut, Settings2, UserCircle, X } from "lucide-react";
import type { Role, View } from "@/types";
import { Button } from "./ui";

const commonLinks = [
  ["inicio", "Início", LayoutDashboard], ["perfil", "Meu perfil", UserCircle], ["horarios", "Horários", Clock3],
  ["calendario", "Calendário", CalendarDays], ["eventos", "Eventos", Images],
] as const;

export function Sidebar({ view, role, open, onNavigate, onClose, onLogout }: { view: View; role: Role; open: boolean; onNavigate: (view: View) => void; onClose: () => void; onLogout: () => void }) {
  const roleLabel = role === "aluno" ? "Área do estudante" : role === "professor" ? "Área do professor" : "Gestão escolar";
  return <><div className={`fixed inset-0 z-30 bg-slate-950/70 lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose}/>
    <aside className={`sidebar-shell fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-panel/95 p-5 backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-9 flex items-center gap-3 px-2"><span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon"><GraduationCap/></span><div><strong>Portal ETE</strong><p className="text-xs text-slate-500">Sistema Escolar Digital</p></div><button className="ml-auto lg:hidden" onClick={onClose} aria-label="Fechar menu"><X/></button></div>
      <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600">{roleLabel}</p>
      <nav aria-label="Navegação principal" className="grid gap-1.5">{commonLinks.map(([id, label, Icon]) => <button key={id} onClick={() => onNavigate(id)} className={`nav-item ${view === id ? "active" : ""}`}><Icon size={20}/><span>{label}</span></button>)}
        {role === "aluno" && <button onClick={() => onNavigate("sugestoes")} className={`nav-item ${view === "sugestoes" ? "active" : ""}`}><Lightbulb size={20}/><span>Enviar sugestão</span></button>}
        {role !== "aluno" && <button onClick={() => onNavigate("admin")} className={`nav-item ${view === "admin" ? "active" : ""}`}><Settings2 size={20}/><span>{role === "professor" ? "Publicar eventos" : "Administração"}</span></button>}
      </nav>
      <Button onClick={onLogout} className="mt-auto justify-start bg-red-500/10 text-red-300 hover:bg-red-500/20"><LogOut size={19}/> Sair</Button>
    </aside></>;
}
