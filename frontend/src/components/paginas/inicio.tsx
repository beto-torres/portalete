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
import { obterPrimeiroNome } from "@/lib/nome-usuario";
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
import { useEffect, useState } from "react";

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
          title: `Olá, ${obterPrimeiroNome(user.name)}!`,
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
            title: `Bom trabalho, ${obterPrimeiroNome(user.name)}!`,
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
            title: `Olá, ${obterPrimeiroNome(user.name)}!`,
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
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const active = countdowns.filter(
    (c) => c.active && new Date(`${c.date}T23:59:59`) >= now,
  );
  if (!active.length) return null;
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Contagem regressiva</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((c) => {
          const eventDate = new Date(`${c.date}T00:00:00`);
          const remainingMs = Math.max(0, eventDate.getTime() - now.getTime());
          const totalSeconds = Math.ceil(remainingMs / 1_000);
          const days = Math.floor(totalSeconds / 86_400);
          const hours = Math.floor((totalSeconds % 86_400) / 3_600);
          const minutes = Math.floor((totalSeconds % 3_600) / 60);
          const seconds = totalSeconds % 60;
          const progress = Math.floor(Math.max(0, Math.min(1, 1 - remainingMs / (30 * 86_400_000))) * 100);
          return (
            <Panel key={c.id} className="countdown-card overflow-hidden p-5">
              <div className="flex items-center gap-3">
                <span className="countdown-icon grid size-10 place-items-center rounded-xl">
                  <Clock3 />
                </span>
                <strong>{c.title}</strong>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2" role="timer" aria-label="Tempo restante">
                {[
                  { label: "dias", value: days },
                  { label: "horas", value: hours },
                  { label: "minutos", value: minutes },
                  { label: "segundos", value: seconds },
                ].map(({ label, value }) => (
                  <div key={label} className="min-w-0 text-center">
                    <span className="countdown-days block text-2xl font-bold tabular-nums sm:text-3xl">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
              <div
                className="countdown-track mt-4 h-2.5 rounded-full"
                role="progressbar"
                aria-label={`Contagem para ${c.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-valuetext={`${progress}%, ${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos restantes`}
              >
                <div className="countdown-progress h-full rounded-full transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
