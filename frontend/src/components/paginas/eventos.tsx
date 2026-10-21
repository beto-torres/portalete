"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { alunoPodeAcessarEvento, obterTurmaDoAluno } from "@/lib/aluno-acesso";
import type { SchoolEvent, User } from "@/types";
import { EmptyState, Field, Panel, Select } from "../ui";

const ITENS_POR_PAGINA = 6;

function formatarPublicoAlvo(publicoAlvo: string) {
  return publicoAlvo
    .replace(/^DS\b/, "Desenvolvimento de Sistemas")
    .replace(/^NUT\b/, "Nutrição e Dietética")
    .replaceAll(" — ", " :: ");
}

function gerarNumerosDePagina(atual: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (atual <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (atual >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", atual - 1, atual, atual + 1, "...", total];
}

export function PaginaEventos({
  events,
  user,
}: {
  events: SchoolEvent[];
  user?: User;
}) {
  const [category, setCategory] = useState("Todos");
  const [period, setPeriod] = useState("upcoming");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const alunoTurma = obterTurmaDoAluno(user);
  const isAlunoRestrito = user?.role === "aluno" && !!alunoTurma;
  const isAdmin = user?.role === "admin";

  // Alunos só acessam eventos gerais ou destinados à sua turma, curso e série
  const eventosPermitidos = isAlunoRestrito
    ? events.filter((e) => alunoPodeAcessarEvento(e, alunoTurma))
    : events;

  const categories = [
    "Todos",
    ...Array.from(new Set(eventosPermitidos.map((e) => e.category))),
  ];

  const visible = eventosPermitidos
    .filter(
      (e) =>
        (category === "Todos" || e.category === category) &&
        (period === "all" || new Date(`${e.date}T23:59:59`) >= new Date()),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDePaginas = Math.max(1, Math.ceil(visible.length / ITENS_POR_PAGINA));

  // Resetar para a primeira página ao alterar filtros
  useEffect(() => {
    setPaginaAtual(1);
  }, [category, period]);

  // Garantir que a página atual não exceda o total
  useEffect(() => {
    if (paginaAtual > totalDePaginas) {
      setPaginaAtual(totalDePaginas);
    }
  }, [paginaAtual, totalDePaginas]);

  const primeiroIndice = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const eventosExibidos = visible.slice(
    primeiroIndice,
    primeiroIndice + ITENS_POR_PAGINA,
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Mural de eventos</h1>
            {isAlunoRestrito && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Lock size={12} /> {alunoTurma.nomeCompleto}
              </span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                <ShieldCheck size={12} /> Administrador
              </span>
            )}
          </div>
          <p className="page-subtitle">
            {isAlunoRestrito
              ? `Exibindo eventos abertos à escola e exclusivos da sua turma (${alunoTurma.nomeCompleto}).`
              : isAdmin
                ? "Visão administrativa."
                : "Tudo o que acontece na comunidade escolar."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Field label="Período">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="upcoming">Próximos eventos</option>
              <option value="all">Todos</option>
            </Select>
          </Field>
          <Field label="Categoria">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
        <p>
          {visible.length}{" "}
          {visible.length === 1 ? "evento encontrado" : "eventos encontrados"}
          {visible.length > 0 && (
            <span className="text-slate-500">
              {" "}
              (página {paginaAtual} de {totalDePaginas})
            </span>
          )}
        </p>
        {visible.length > 0 && (
          <p className="text-xs text-slate-500 sm:text-sm">
            Exibindo{" "}
            <span className="font-semibold text-slate-300">
              {primeiroIndice + 1}–
              {Math.min(primeiroIndice + ITENS_POR_PAGINA, visible.length)}
            </span>{" "}
            de <span className="font-semibold text-slate-300">{visible.length}</span>
          </p>
        )}
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {eventosExibidos.length ? (
          eventosExibidos.map((e) => (
            <Panel
              key={e.id}
              className="event-card"
              style={{ borderTopColor: e.color }}
            >
              <span
                className="badge"
                style={{ backgroundColor: `${e.color}22`, color: e.color }}
              >
                {e.category}
              </span>
              <h2>{e.title}</h2>
              <p>
                <CalendarDays />{" "}
                {new Date(`${e.date}T12:00:00`).toLocaleDateString("pt-BR")} às{" "}
                {e.time}
              </p>
              <p>
                <MapPin /> {e.location}
              </p>
              <p>
                <Users /> {formatarPublicoAlvo(e.audience)}
              </p>
              <p className="description">{e.description}</p>
              {e.link && (
                <a
                  className="link mt-3 inline-flex items-center gap-2"
                  href={e.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir link <ExternalLink size={15} />
                </a>
              )}
            </Panel>
          ))
        ) : (
          <EmptyState
            title="Nenhum evento encontrado"
            text={
              isAlunoRestrito
                ? `Não há eventos agendados para a sua turma (${alunoTurma.nomeCompleto}) ou gerais no momento.`
                : "Altere os filtros para consultar outros eventos."
            }
          />
        )}
      </div>

      {visible.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-slate-400">
            Página <span className="font-semibold text-slate-200">{paginaAtual}</span> de{" "}
            <span className="font-semibold text-slate-200">{totalDePaginas}</span>
          </p>

          <nav
            className="flex flex-wrap items-center justify-center gap-1.5"
            aria-label="Paginação de eventos"
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-panel/60 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={paginaAtual === 1}
              onClick={() => {
                setPaginaAtual((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-1">
              {gerarNumerosDePagina(paginaAtual, totalDePaginas).map((item, idx) => {
                if (item === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-sm text-slate-500"
                    >
                      …
                    </span>
                  );
                }
                const isAtiva = item === paginaAtual;
                return (
                  <button
                    key={item}
                    type="button"
                    className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                      isAtiva
                        ? "bg-primary text-white shadow-sm"
                        : "border border-white/10 bg-panel/40 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                    onClick={() => {
                      setPaginaAtual(item);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    aria-current={isAtiva ? "page" : undefined}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-panel/60 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={paginaAtual === totalDePaginas}
              onClick={() => {
                setPaginaAtual((p) => Math.min(totalDePaginas, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span>Próxima</span>
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
