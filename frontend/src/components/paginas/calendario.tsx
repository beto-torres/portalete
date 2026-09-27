"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { alunoPodeAcessarEvento, obterTurmaDoAluno } from "@/lib/aluno-acesso";
import type { SchoolEvent, User } from "@/types";
import { Panel } from "../ui";

export function PaginaCalendario({
  events,
  user,
}: {
  events: SchoolEvent[];
  user?: User;
}) {
  const alunoTurma = obterTurmaDoAluno(user);
  const isAlunoRestrito = user?.role === "aluno" && !!alunoTurma;

  const eventosPermitidos = isAlunoRestrito
    ? events.filter((e) => alunoPodeAcessarEvento(e, alunoTurma))
    : events;

  return (
    <Panel className="calendar-panel overflow-x-auto p-4 sm:p-6">
      <div className="min-w-[720px]">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          titleFormat={({ date }) =>
            `Calendário - ${new Intl.DateTimeFormat("pt-BR", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })
              .format(date.marker)
              .replace(" de ", " ")}`
          }
          height="auto"
          headerToolbar={{ left: "prev,next", center: "title", right: "today" }}
          events={eventosPermitidos.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            backgroundColor: e.color,
            borderColor: e.color,
          }))}
        />
      </div>
    </Panel>
  );
}
