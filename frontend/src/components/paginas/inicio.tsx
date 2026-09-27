"use client";

import {
  CalendarDays,
  Clock3,
  Lightbulb,
  Plus,
  Settings2,
  Sparkles,
} from "lucide-react";
import { classes } from "@/lib/data";
import {
  alunoPodeAcessarEvento,
  alunoPodeAcessarHorario,
  obterTurmaDoAluno,
} from "@/lib/aluno-acesso";
import type {
  Countdown,
  ScheduleItem,
  SchoolEvent,
  Suggestion,
  User,
  View,
} from "@/types";
import { Panel } from "../ui";

export function PaginaInicio({
  user,
  events,
  countdowns,
  suggestions,
  schedule,
  navigate,
}: {
  user: User;
  events: SchoolEvent[];
  countdowns: Countdown[];
  suggestions: Suggestion[];
  schedule: ScheduleItem[];
  navigate: (view: View) => void;
}) {
  const alunoTurma = obterTurmaDoAluno(user);
  const isAlunoRestrito = user.role === "aluno" && !!alunoTurma;

  const eventosPermitidos = isAlunoRestrito
    ? events.filter((e) => alunoPodeAcessarEvento(e, alunoTurma))
    : events;

  const aulasTurma = isAlunoRestrito
    ? schedule.filter((s) => alunoPodeAcessarHorario(s, alunoTurma))
    : schedule;

  const upcoming = eventosPermitidos.filter(
    (event) => new Date(`${event.date}T23:59:59`) >= new Date(),
  ).length;

  const content =
    user.role === "aluno"
      ? {
          badge: alunoTurma
            ? `Estudante — Turma ${alunoTurma.nomeCompleto}`
            : "Painel do estudante",
          title: `Olá, ${user.name}!`,
          text: alunoTurma
            ? `Rotina e avisos exclusivos da sua turma: ${alunoTurma.nomeCompleto} (${alunoTurma.cursoNome}).`
            : "Consulte sua rotina escolar e acompanhe as próximas atividades.",
          actions: [
            ["horarios", "Meus horários", "Consulte sua grade semanal", Clock3],
            [
              "calendario",
              "Calendário escolar",
              "Veja datas importantes",
              CalendarDays,
            ],
            ["eventos", "Próximos eventos", "Acompanhe a agenda", Sparkles],
            [
              "sugestoes",
              "Enviar sugestão",
              "Compartilhe sua ideia",
              Lightbulb,
            ],
          ] as const,
          stats: [
            ["Próximos eventos", upcoming],
            ["Aulas da sua turma", aulasTurma.length],
            ["Contagens ativas", countdowns.filter((c) => c.active).length],
          ] as const,
        }
      : user.role === "professor"
        ? {
            badge: "Painel do professor",
            title: `Bom trabalho, ${user.name}!`,
            text: "Acompanhe a agenda escolar e publique eventos para suas turmas.",
            actions: [
              ["horarios", "Consultar horários", "Veja turmas e aulas", Clock3],
              [
                "calendario",
                "Calendário escolar",
                "Organize as próximas datas",
                CalendarDays,
              ],
              [
                "eventos",
                "Mural de eventos",
                "Consulte as publicações",
                Sparkles,
              ],
              ["admin", "Publicar evento", "Cadastre uma nova atividade", Plus],
            ] as const,
            stats: [
              ["Eventos publicados", events.length],
              ["Próximos eventos", upcoming],
              ["Turmas cadastradas", classes.length],
            ] as const,
          }
        : {
            badge: "Painel administrativo",
            title: `Olá, ${user.name}!`,
            text: "Acompanhe os dados do portal e acesse rapidamente as áreas de gestão.",
            actions: [
              [
                "admin",
                "Gerenciar eventos",
                "Publique e remova eventos",
                Sparkles,
              ],
              [
                "admin",
                "Gerenciar horários",
                "Atualize a grade escolar",
                Clock3,
              ],
              [
                "admin",
                "Gerenciar contagens",
                "Destaque datas importantes",
                CalendarDays,
              ],
              [
                "admin",
                "Ver sugestões",
                "Analise ideias dos alunos",
                Settings2,
              ],
            ] as const,
            stats: [
              ["Eventos", events.length],
              ["Horários cadastrados", schedule.length],
              ["Sugestões recebidas", suggestions.length],
            ] as const,
          };
  return (
    <div className="grid gap-6">
      <section className="hero">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> {content.badge}
          </span>
          <h1>{content.title}</h1>
          <p>{content.text}</p>
        </div>
        <div className="hidden size-40 animate-float place-items-center rounded-full border border-white/10 bg-white/5 md:grid">
          <div className="grid size-28 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-6xl">
            🎓
          </div>
        </div>
      </section>
      <Countdowns countdowns={countdowns} />
      <div>
        <h2 className="mb-4 text-lg font-semibold">Acessos rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {content.actions.map(([id, title, text, Icon], index) => (
            <button
              key={`${id}-${index}`}
              onClick={() => navigate(id)}
              className="quick-card"
            >
              <Icon />
              <strong>{title}</strong>
              <span>{text}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {content.stats.map(([label, value]) => (
          <Panel key={label} className="p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Countdowns({ countdowns }: { countdowns: Countdown[] }) {
  const now = new Date();
  const active = countdowns.filter(
    (c) => c.active && new Date(`${c.date}T23:59:59`) >= now,
  );
  if (!active.length) return null;
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Contagem regressiva</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((c) => {
          const days = Math.max(
            0,
            Math.ceil(
              (new Date(`${c.date}T00:00:00`).getTime() - now.getTime()) /
                86400000,
            ),
          );
          return (
            <Panel key={c.id} className="overflow-hidden p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Clock3 />
                </span>
                <strong>{c.title}</strong>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <span className="text-4xl font-bold text-violet-300">
                  {days}
                </span>
                <span className="pb-1 text-sm text-slate-400">
                  dias restantes
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
