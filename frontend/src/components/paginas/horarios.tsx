"use client";

import { useState } from "react";
import { Download, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { baixarHorarioEmPdf } from "@/lib/gerar-pdf-horario";
import { obterTurmaDoAluno } from "@/lib/aluno-acesso";
import type { ScheduleItem, User } from "@/types";
import { Button, Field, Panel, Select } from "../ui";

export function PaginaHorarios({
  schedule,
  user,
}: {
  schedule: ScheduleItem[];
  user?: User;
}) {
  const alunoTurma = obterTurmaDoAluno(user);
  const isAlunoRestrito = user?.role === "aluno" && !!alunoTurma;

  const [curso, setCurso] = useState(alunoTurma?.curso ?? "DS");
  const [serie, setSerie] = useState(alunoTurma?.serie ?? "1º");
  const [turma, setTurma] = useState(alunoTurma?.turma ?? "A");

  // Para o aluno, os valores ativos são estritamente os da sua turma vinculada
  const cursoAtivo = isAlunoRestrito ? alunoTurma.curso : curso;
  const serieAtiva = isAlunoRestrito ? alunoTurma.serie : serie;
  const turmaAtiva = isAlunoRestrito ? alunoTurma.turma : turma;

  const turmaSelecionada = isAlunoRestrito
    ? alunoTurma.nomeCompleto
    : `${serieAtiva} ${cursoAtivo} ${turmaAtiva}`;

  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  async function baixarPdf() {
    try {
      await baixarHorarioEmPdf({
        curso: cursoAtivo,
        serie: serieAtiva,
        turma: turmaAtiva,
        horarios: schedule,
      });
    } catch {
      toast.error("Não foi possível gerar o PDF do horário.");
    }
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Horários</h1>
          <p className="page-subtitle">
            {isAlunoRestrito
              ? `Grade de aulas exclusiva da sua turma (${alunoTurma.nomeCompleto}).`
              : "Consulte a grade semanal por turma."}
          </p>
        </div>

        <div className="flex w-full flex-nowrap items-center gap-3 overflow-x-auto pb-1 sm:w-auto">
          {isAlunoRestrito ? (
            <div className="flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Lock size={16} className="shrink-0" />
              <span>
                Sua turma: <strong>{alunoTurma.nomeCompleto}</strong> (
                {alunoTurma.cursoNome} — {alunoTurma.serieNome})
              </span>
            </div>
          ) : (
            <>
              <div className="min-w-64">
                <Field label="Curso">
                  <Select
                    value={curso}
                    onChange={(event) => setCurso(event.target.value)}
                  >
                    <option value="DS">Desenvolvimento de Sistemas</option>
                    <option value="NUT">Nutrição e Dietética</option>
                  </Select>
                </Field>
              </div>

              <div className="min-w-36">
                <Field label="Série">
                  <Select
                    value={serie}
                    onChange={(event) => setSerie(event.target.value)}
                  >
                    <option value="1º">1º Ano</option>
                    <option value="2º">2º Ano</option>
                    <option value="3º">3º Ano</option>
                  </Select>
                </Field>
              </div>

              <div className="min-w-28">
                <Field label="Turma">
                  <Select
                    value={turma}
                    onChange={(event) => setTurma(event.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </Select>
                </Field>
              </div>
            </>
          )}

          <Button
            type="button"
            className="size-11 shrink-0 bg-primary p-0 text-white"
            onClick={baixarPdf}
            aria-label="Baixar horário em PDF"
            title="Baixar horário em PDF"
          >
            <Download size={18} />
          </Button>
        </div>
      </div>

      <Panel className="schedule-panel">
        <div className="schedule-scroll">
          <table className="schedule-table">
            <colgroup>
              <col className="lesson-column" />
              {days.map((day) => (
                <col key={day} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th>Aula</th>
                {days.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((lesson) => (
                <tr key={lesson}>
                  <th>{lesson}ª</th>
                  {days.map((_, day) => {
                    const item = schedule.find(
                      (s) =>
                        s.className === turmaSelecionada &&
                        s.day === day + 1 &&
                        s.lesson === lesson,
                    );
                    return (
                      <td key={day}>
                        {item ? (
                          <>
                            <strong>{item.subject}</strong>
                            <span>{item.teacher}</span>
                          </>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
