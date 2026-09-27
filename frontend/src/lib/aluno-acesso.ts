import type { ScheduleItem, SchoolEvent, User } from "@/types";

export interface InfoTurmaAluno {
  curso: string; // "DS" | "NUT"
  cursoNome: string; // "Desenvolvimento de Sistemas" | "Nutrição e Dietética"
  serie: string; // "1º" | "2º" | "3º"
  serieNome: string; // "1º Ano" | "2º Ano" | "3º Ano"
  turma: string; // "A" | "B"
  nomeCompleto: string; // "2º DS A"
  siglaNormalizada: string; // "2DSA"
}

export function normalizarSiglaTurma(valor?: string | null): string {
  if (!valor) return "";
  return valor.replace(/[º°\s\-–—]/g, "").toUpperCase();
}

export function obterTurmaDoAluno(user?: User | null): InfoTurmaAluno | null {
  if (!user || user.role !== "aluno") return null;

  const rawNome = (user.className ?? user.classGroup?.name ?? "").trim();
  const rawCurso = (user.course?.acronym ?? user.course?.name ?? "").trim();
  const rawSerie = (user.grade?.acronym ?? user.grade?.name ?? "").trim();
  const rawLetra = (user.classGroup?.letter ?? "").trim();

  const normalizado = normalizarSiglaTurma(
    rawNome ||
      (rawSerie && rawCurso && rawLetra
        ? `${rawSerie}${rawCurso}${rawLetra}`
        : ""),
  );

  // Se o aluno ainda não possui nenhuma informação cadastrada
  if (!normalizado && !rawCurso && !rawSerie && !rawLetra) {
    return null;
  }

  // Detectar curso
  let curso = "DS";
  if (normalizado.includes("NUT") || rawCurso.toUpperCase().includes("NUT")) {
    curso = "NUT";
  } else if (
    normalizado.includes("DS") ||
    rawCurso.toUpperCase().includes("DS")
  ) {
    curso = "DS";
  }

  // Detectar série
  let serie = "1º";
  if (normalizado.includes("2") || rawSerie.includes("2")) {
    serie = "2º";
  } else if (normalizado.includes("3") || rawSerie.includes("3")) {
    serie = "3º";
  } else if (normalizado.includes("1") || rawSerie.includes("1")) {
    serie = "1º";
  }

  // Detectar turma / letra
  let turma = "A";
  if (normalizado.endsWith("B") || rawLetra.toUpperCase() === "B") {
    turma = "B";
  } else {
    turma = "A";
  }

  const cursoNome =
    curso === "DS" ? "Desenvolvimento de Sistemas" : "Nutrição e Dietética";
  const serieNome = `${serie} Ano`;
  const nomeCompleto = `${serie} ${curso} ${turma}`;
  const siglaNormalizada = `${serie.replace(/\D/g, "")}${curso}${turma}`;

  return {
    curso,
    cursoNome,
    serie,
    serieNome,
    turma,
    nomeCompleto,
    siglaNormalizada,
  };
}

export function alunoPodeAcessarHorario(
  item: ScheduleItem,
  alunoTurma: InfoTurmaAluno | null,
): boolean {
  if (!alunoTurma) return true;
  return (
    normalizarSiglaTurma(item.className) === alunoTurma.siglaNormalizada ||
    item.className.trim() === alunoTurma.nomeCompleto
  );
}

export function alunoPodeAcessarEvento(
  evento: SchoolEvent,
  alunoTurma: InfoTurmaAluno | null,
): boolean {
  if (!alunoTurma) return true;
  const audience = (evento.audience || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[º°]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!audience || audience.includes("geral")) return true;

  // Cada dimensão é avaliada separadamente. "Todas as turmas" não libera
  // automaticamente um evento restrito a determinado curso ou série.
  const todosOsCursos = audience.includes("todos os cursos");
  const temDS =
    /(^|\s|-)ds(\s|-|$)/.test(audience) ||
    audience.includes("desenvolvimento de sistemas");
  const temNUT =
    /(^|\s|-)nut(\s|-|$)/.test(audience) || audience.includes("nutricao");
  if (!todosOsCursos) {
    if (temDS && !temNUT && alunoTurma.curso !== "DS") return false;
    if (temNUT && !temDS && alunoTurma.curso !== "NUT") return false;
  }

  const todasAsSeries =
    audience.includes("todas as series") || audience.includes("todos os anos");
  const tem1Ano = /(^|\s|-)1(\s*ano|\s|-|$)/.test(audience);
  const tem2Ano = /(^|\s|-)2(\s*ano|\s|-|$)/.test(audience);
  const tem3Ano = /(^|\s|-)3(\s*ano|\s|-|$)/.test(audience);
  if (todasAsSeries) {
    // Sem restrição de série.
  } else {
    if (tem1Ano && !tem2Ano && !tem3Ano && alunoTurma.serie !== "1º")
      return false;
    if (tem2Ano && !tem1Ano && !tem3Ano && alunoTurma.serie !== "2º")
      return false;
    if (tem3Ano && !tem1Ano && !tem2Ano && alunoTurma.serie !== "3º")
      return false;
  }

  const todasAsTurmas = audience.includes("todas as turmas");
  const temTurmaA =
    audience.includes("turma a") || audience.includes("letra a");
  const temTurmaB =
    audience.includes("turma b") || audience.includes("letra b");
  if (!todasAsTurmas) {
    if (temTurmaA && !temTurmaB && alunoTurma.turma !== "A") return false;
    if (temTurmaB && !temTurmaA && alunoTurma.turma !== "B") return false;
  }

  return true;
}
