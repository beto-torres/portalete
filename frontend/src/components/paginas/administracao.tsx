"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { Check, Clock3, PencilLine, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { classes, roleNames, teachers } from "@/lib/data";
import { api } from "@/lib/api";
import { confirmarComToast } from "@/lib/confirmar-com-toast";
import type {
  Countdown,
  PasswordResetRequest,
  Role,
  ScheduleItem,
  SchoolEvent,
  Suggestion,
} from "@/types";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
} from "../ui";

type Props = {
  role: Role;
  events: SchoolEvent[];
  setEvents: Dispatch<SetStateAction<SchoolEvent[]>>;
  countdowns: Countdown[];
  setCountdowns: Dispatch<SetStateAction<Countdown[]>>;
  suggestions: Suggestion[];
  setSuggestions: Dispatch<SetStateAction<Suggestion[]>>;
  schedule: ScheduleItem[];
  setSchedule: Dispatch<SetStateAction<ScheduleItem[]>>;
};

export function PaginaAdministracao(props: Props) {
  const [tab, setTab] = useState<
    "events" | "schedule" | "countdowns" | "suggestions" | "passwords"
  >("events");
  const allowed =
    props.role === "admin"
      ? ([
          "events",
          "schedule",
          "countdowns",
          "suggestions",
          "passwords",
        ] as const)
      : (["events"] as const);
  const labels = {
    events: "Eventos",
    schedule: "Horários",
    countdowns: "Contagens",
    suggestions: "Sugestões",
    passwords: "Renovação de senhas",
  } as const;
  return (
    <div>
      <h1 className="page-title">Administração</h1>
      <p className="page-subtitle">
        Gerencie as informações publicadas no portal.
      </p>
      <div className="tabs">
        {allowed.map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {labels[item]}
          </button>
        ))}
      </div>
      {tab === "events" && (
        <AdminEvents events={props.events} setEvents={props.setEvents} />
      )}{" "}
      {tab === "schedule" && (
        <AdminSchedule
          schedule={props.schedule}
          setSchedule={props.setSchedule}
        />
      )}{" "}
      {tab === "countdowns" && (
        <AdminCountdowns
          countdowns={props.countdowns}
          setCountdowns={props.setCountdowns}
        />
      )}{" "}
      {tab === "suggestions" && (
        <AdminSuggestions
          suggestions={props.suggestions}
          setSuggestions={props.setSuggestions}
        />
      )}{" "}
      {tab === "passwords" && <AdminPasswordRequests />}
    </div>
  );
}

function AdminPasswordRequests() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState<{
    code: string;
    name: string;
    email: string;
    expiresAt: string;
  } | null>(null);
  useEffect(() => {
    api
      .passwordResetRequests()
      .then(setRequests)
      .catch((error) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as solicitações.",
        ),
      );
  }, []);
  async function approve(item: PasswordResetRequest) {
    const confirmado = await confirmarComToast(
      `Aprovar a recuperação de senha de ${item.user.name}?`,
      "Aprovar",
    );
    if (!confirmado) return;
    try {
      const result = await api.approvePasswordReset(item.id);
      setRequests((current) =>
        current.filter((request) => request.id !== item.id),
      );
      setGenerated({
        code: result.code,
        name: result.user.name,
        email: result.user.email,
        expiresAt: result.expiresAt,
      });
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível aprovar a solicitação.",
      );
    }
  }
  return (
    <div className="grid gap-4">
      {generated && (
        <Panel className="border border-emerald-400/30 p-5">
          <span className="badge bg-emerald-400/10 text-emerald-300">
            Código gerado
          </span>
          <h2 className="mt-3 font-semibold">
            Entregue este código a {generated.name}
          </h2>
          <p className="text-sm text-slate-400">{generated.email}</p>
          <strong className="my-4 block font-mono text-3xl tracking-[.35em] text-emerald-300">
            {generated.code}
          </strong>
          <p className="text-sm text-amber-300">
            Ele expira em{" "}
            {new Date(generated.expiresAt).toLocaleString("pt-BR")} e só pode
            ser usado uma vez. Copie-o agora: por segurança, não será exibido
            novamente.
          </p>
          <Button
            className="mt-4 bg-white/10"
            onClick={() => setGenerated(null)}
          >
            Código entregue
          </Button>
        </Panel>
      )}
      {message && <Message text={message} />}{" "}
      {requests.length ? (
        requests.map((item) => (
          <Panel
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
            key={item.id}
          >
            <div className="min-w-0 flex-1">
              <span className="badge bg-amber-400/10 text-amber-300">
                Pendente
              </span>
              <h2 className="mt-3 font-semibold">{item.user.name}</h2>
              <p className="text-sm text-slate-400">
                {item.user.email} • {roleNames[item.user.role]}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {item.reason || "Solicitação de recuperação de senha."}
              </p>
              <small className="mt-2 block text-slate-500">
                Solicitado em {new Date(item.createdAt).toLocaleString("pt-BR")}
              </small>
            </div>
            <Button
              onClick={() => approve(item)}
              className="bg-primary text-white"
            >
              Aprovar e gerar código
            </Button>
          </Panel>
        ))
      ) : (
        <EmptyState
          title="Nenhuma recuperação pendente"
          text="As solicitações de usuários aparecerão aqui."
        />
      )}
    </div>
  );
}

function montarPublicoAlvo(curso: string, serie: string, turma: string) {
  if (curso === "TODOS" && serie === "TODOS" && turma === "TODOS") {
    return "Geral - Todas as turmas";
  }

  const cursoSelecionado = curso === "TODOS" ? "Todos os cursos" : curso;
  const serieSelecionada = serie === "TODOS" ? "Todas as séries" : serie;
  const turmaSelecionada =
    turma === "TODOS" ? "Todas as turmas" : `Turma ${turma}`;

  return `${cursoSelecionado} - ${serieSelecionada} - ${turmaSelecionada}`;
}

function formatarData(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatarPublicoAlvo(publicoAlvo: string) {
  return publicoAlvo
    .replace(/^DS\b/, "Desenvolvimento de Sistemas")
    .replace(/^NUT\b/, "Nutrição e Dietética")
    .replaceAll(" — ", " - ");
}

function ordenarEventosPorProximidade(eventos: SchoolEvent[]) {
  const dataAtual = new Date();
  const hoje = [
    dataAtual.getFullYear(),
    String(dataAtual.getMonth() + 1).padStart(2, "0"),
    String(dataAtual.getDate()).padStart(2, "0"),
  ].join("-");

  return [...eventos].sort((eventoA, eventoB) => {
    const eventoAPassou = eventoA.date < hoje;
    const eventoBPassou = eventoB.date < hoje;

    if (eventoAPassou !== eventoBPassou) {
      return eventoAPassou ? 1 : -1;
    }

    if (eventoAPassou) {
      return eventoB.date.localeCompare(eventoA.date);
    }

    return eventoA.date.localeCompare(eventoB.date);
  });
}

function AdminEvents({
  events,
  setEvents,
}: {
  events: SchoolEvent[];
  setEvents: Dispatch<SetStateAction<SchoolEvent[]>>;
}) {
  const eventosPorPagina = 8;
  const [paginaAtual, setPaginaAtual] = useState(1);
  const totalDePaginas = Math.max(
    1,
    Math.ceil(events.length / eventosPorPagina),
  );
  const primeiroEvento = (paginaAtual - 1) * eventosPorPagina;
  const eventosOrdenados = ordenarEventosPorProximidade(events);
  const eventosVisiveis = eventosOrdenados.slice(
    primeiroEvento,
    primeiroEvento + eventosPorPagina,
  );

  useEffect(() => {
    if (paginaAtual > totalDePaginas) {
      setPaginaAtual(totalDePaginas);
    }
  }, [paginaAtual, totalDePaginas]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    try {
      const created = await api.createEvent({
        title: String(d.get("title")),
        date: String(d.get("date")),
        time: String(d.get("time")),
        location: String(d.get("location")),
        audience: montarPublicoAlvo(
          String(d.get("audienceCourse")),
          String(d.get("audienceGrade")),
          String(d.get("audienceClass")),
        ),
        category: String(d.get("category")),
        description: String(d.get("description")),
        color: String(d.get("color")),
        link: String(d.get("link")) || undefined,
      });
      setEvents((value) => [...value, created]);
      setPaginaAtual(1);
      form.reset();
      toast.success("Evento publicado com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível publicar.",
      );
    }
  }
  return (
    <div className="admin-grid">
      <Panel className="p-5">
        <h2 className="form-title">
          <Plus /> Novo evento
        </h2>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="Título">
            <Input name="title" required />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Data">
              <Input name="date" type="date" required />
            </Field>
            <Field label="Horário">
              <Input name="time" type="time" required />
            </Field>
          </div>
          <Field label="Local">
            <Input name="location" required />
          </Field>
          <fieldset className="grid gap-2">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Curso">
                <Select name="audienceCourse" defaultValue="TODOS">
                  <option value="DS">Desenvolvimento de Sistemas</option>
                  <option value="NUT">Nutrição e Dietética</option>
                  <option value="TODOS">TODOS</option>
                </Select>
              </Field>
              <Field label="Série">
                <Select name="audienceGrade" defaultValue="TODOS">
                  <option value="1º Ano">1º Ano</option>
                  <option value="2º Ano">2º Ano</option>
                  <option value="3º Ano">3º Ano</option>
                  <option value="TODOS">TODOS</option>
                </Select>
              </Field>
              <Field label="Turma">
                <Select name="audienceClass" defaultValue="TODOS">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="TODOS">TODOS</option>
                </Select>
              </Field>
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Categoria">
              <Select name="category">
                <option>Educação</option>
                <option>Ensino Técnico</option>
                <option>Provas e Simulados</option>
                <option>Projetos e Feiras</option>
                <option>Estágios e Carreiras</option>
                <option>Reuniões e Comunicados</option>
                <option>Cultura e Artes</option>
                <option>Esportes e Jogos</option>
                <option>Saúde e Bem-estar</option>
                <option>Visitas Técnicas</option>
                <option>Formaturas e Celebrações</option>
                <option>Outros</option>
              </Select>
            </Field>
            <Field label="Cor">
              <Input name="color" type="color" defaultValue="#8b5cf6" />
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea name="description" required />
          </Field>
          <Field label="Link opcional">
            <Input name="link" type="url" />
          </Field>
          <Button className="bg-primary text-white">Publicar evento</Button>
        </form>
      </Panel>
      <Panel className="flex min-h-0 flex-col p-5">
        <h2 className="form-title">Eventos publicados</h2>

        <div className="grid content-start gap-3">
          {eventosVisiveis.map((evento) => (
            <Record
              key={evento.id}
              title={evento.title}
              subtitle={`${formatarData(evento.date)} • ${formatarPublicoAlvo(evento.audience)}`}
              onDelete={async () => {
                await api.deleteEvent(evento.id);
                setEvents((value) =>
                  value.filter((item) => item.id !== evento.id),
                );
              }}
            />
          ))}

          {!events.length && (
            <EmptyState
              title="Nenhum evento publicado"
              text="Os eventos cadastrados aparecerão aqui."
            />
          )}
        </div>

        {events.length > 0 && (
          <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Exibindo {primeiroEvento + 1}–
              {Math.min(primeiroEvento + eventosPorPagina, events.length)} de{" "}
              {events.length}
            </p>

            <nav
              className="flex items-center gap-2"
              aria-label="Paginação de eventos"
            >
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual((pagina) => pagina - 1)}
              >
                Anterior
              </button>
              <span className="min-w-20 text-center text-sm text-slate-300">
                {paginaAtual} de {totalDePaginas}
              </span>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={paginaAtual === totalDePaginas}
                onClick={() => setPaginaAtual((pagina) => pagina + 1)}
              >
                Próxima
              </button>
            </nav>
          </div>
        )}
      </Panel>
    </div>
  );
}

function AdminSchedule({
  schedule,
  setSchedule,
}: {
  schedule: ScheduleItem[];
  setSchedule: Dispatch<SetStateAction<ScheduleItem[]>>;
}) {
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const item = {
      className: String(d.get("class")),
      teacher: String(d.get("teacher")),
      day: Number(d.get("day")),
      lesson: Number(d.get("lesson")),
      subject: String(d.get("subject")),
    };
    if (
      schedule.some(
        (s) =>
          s.className === item.className &&
          s.day === item.day &&
          s.lesson === item.lesson,
      )
    ) {
      setMessage(
        "Essa turma já possui uma aula nesse dia e horário. Exclua o registro anterior para substituir.",
      );
      return;
    }
    try {
      const created = await api.createSchedule(item);
      setSchedule((value) => [...value, created]);
      setMessage("Horário salvo com sucesso.");
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o horário.",
      );
    }
  }
  return (
    <div className="admin-grid">
      <Panel className="p-5">
        <h2 className="form-title">
          <PencilLine /> Inserir aula
        </h2>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="Turma">
            <Select name="class">
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Professor">
            <Select name="teacher">
              {teachers.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dia">
              <Select name="day">
                <option value="1">Segunda</option>
                <option value="2">Terça</option>
                <option value="3">Quarta</option>
                <option value="4">Quinta</option>
                <option value="5">Sexta</option>
              </Select>
            </Field>
            <Field label="Aula">
              <Input name="lesson" type="number" min="1" max="9" required />
            </Field>
          </div>
          <Field label="Disciplina">
            <Input name="subject" required />
          </Field>
          {message && <Message text={message} />}
          <Button className="bg-primary text-white">Salvar horário</Button>
        </form>
      </Panel>
      <Records
        title="Aulas cadastradas"
        gridClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      >
        {schedule.map((item) => (
          <Record
            key={item.id}
            title={item.subject}
            subtitle={`${item.className} • ${item.teacher} • ${item.lesson}ª aula`}
            onDelete={async () => {
              await api.deleteSchedule(item.id);
              setSchedule((value) =>
                value.filter((current) => current.id !== item.id),
              );
            }}
          />
        ))}
      </Records>
    </div>
  );
}

function AdminCountdowns({
  countdowns,
  setCountdowns,
}: {
  countdowns: Countdown[];
  setCountdowns: Dispatch<SetStateAction<Countdown[]>>;
}) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    try {
      const created = await api.createCountdown({
        title: String(d.get("title")),
        date: String(d.get("date")),
        active: true,
      });
      setCountdowns((value) => [...value, created]);
      form.reset();
      toast.success("Contagem salva com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    }
  }
  return (
    <div className="admin-grid">
      <Panel className="p-5">
        <h2 className="form-title">
          <Clock3 /> Nova contagem
        </h2>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="Evento">
            <Input name="title" required />
          </Field>
          <Field label="Data">
            <Input name="date" type="date" required />
          </Field>
          <Button className="bg-primary text-white">Salvar contagem</Button>
        </form>
      </Panel>
      <Records title="Contagens cadastradas">
        {countdowns.map((item) => (
          <Record
            key={item.id}
            title={item.title}
            subtitle={item.date}
            onDelete={async () => {
              await api.deleteCountdown(item.id);
              setCountdowns((value) =>
                value.filter((current) => current.id !== item.id),
              );
            }}
          />
        ))}
      </Records>
    </div>
  );
}

function AdminSuggestions({
  suggestions,
  setSuggestions,
}: {
  suggestions: Suggestion[];
  setSuggestions: Dispatch<SetStateAction<Suggestion[]>>;
}) {
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const styles = {
    pendente: "bg-amber-400/10 text-amber-300",
    aprovada: "bg-emerald-400/10 text-emerald-300",
    reprovada: "bg-red-400/10 text-red-300",
  } as const;
  async function update(item: Suggestion, status: "aprovada" | "reprovada") {
    setBusyId(item.id);
    setMessage("");
    try {
      const updated = await api.updateSuggestionStatus(item.id, status);
      setSuggestions((value) =>
        value.map((current) => (current.id === item.id ? updated : current)),
      );
      setMessage(`Sugestão ${status} com sucesso.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a sugestão.",
      );
    } finally {
      setBusyId(null);
    }
  }
  async function remove(item: Suggestion) {
    const confirmado = await confirmarComToast(
      `Excluir definitivamente a sugestão “${item.title}”?`,
      "Excluir",
    );
    if (!confirmado) return;
    setBusyId(item.id);
    try {
      await api.deleteSuggestion(item.id);
      setSuggestions((value) =>
        value.filter((current) => current.id !== item.id),
      );
      setMessage("Sugestão excluída com sucesso.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a sugestão.",
      );
    } finally {
      setBusyId(null);
    }
  }
  return (
    <div>
      {message && <Message text={message} />}
      <div className="grid gap-4 md:grid-cols-2">
        {suggestions.length ? (
          suggestions.map((item) => (
            <Panel className="flex flex-col p-5" key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="badge bg-primary/15 text-violet-300">
                  {item.category}
                </span>
                <span className={`badge ${styles[item.status ?? "pendente"]}`}>
                  {item.status ?? "pendente"}
                </span>
              </div>
              <h2 className="mt-3 font-semibold">{item.title}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {item.className} •{" "}
                {new Date(item.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <Button
                  disabled={busyId === item.id || item.status === "aprovada"}
                  onClick={() => update(item, "aprovada")}
                  className="bg-emerald-500/10 text-emerald-300"
                >
                  <Check size={17} /> Aprovar
                </Button>
                <Button
                  disabled={busyId === item.id || item.status === "reprovada"}
                  onClick={() => update(item, "reprovada")}
                  className="bg-amber-500/10 text-amber-300"
                >
                  <X size={17} /> Desaprovar
                </Button>
                <Button
                  disabled={busyId === item.id}
                  onClick={() => remove(item)}
                  className="ml-auto bg-red-500/10 text-red-300"
                >
                  <Trash2 size={17} /> Excluir
                </Button>
              </div>
            </Panel>
          ))
        ) : (
          <EmptyState
            title="Nenhuma sugestão recebida"
            text="As ideias enviadas pelos alunos aparecerão aqui."
          />
        )}
      </div>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <p
      role="status"
      className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-violet-200"
    >
      {text}
    </p>
  );
}
function Records({
  title,
  children,
  gridClassName = "",
}: {
  title: string;
  children: React.ReactNode;
  gridClassName?: string;
}) {
  return (
    <Panel className="p-5">
      <h2 className="form-title">{title}</h2>
      <div className={`grid gap-3 ${gridClassName}`}>{children}</div>
    </Panel>
  );
}
function Record({
  title,
  subtitle,
  onDelete,
}: {
  title: string;
  subtitle: string;
  onDelete: () => void | Promise<void>;
}) {
  async function confirmarExclusao() {
    const confirmado = await confirmarComToast(
      `Deseja realmente excluir “${title}”? Esta ação não pode ser desfeita.`,
      "Excluir",
    );

    if (confirmado) await onDelete();
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3">
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{title}</strong>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </div>
      <Button
        aria-label={`Excluir ${title}`}
        onClick={confirmarExclusao}
        className="size-10 bg-red-500/10 p-0 text-red-300"
      >
        <Trash2 size={17} />
      </Button>
    </div>
  );
}
