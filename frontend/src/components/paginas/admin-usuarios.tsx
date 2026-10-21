"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { roleNames } from "@/lib/data";
import { confirmarComToast } from "@/lib/confirmar-com-toast";
import { usePortal } from "@/contexts/portal-context";
import type { AcademicStructure, Role, User } from "@/types";
import { Button, EmptyState, Field, Input, Panel, Select } from "../ui";

const USERS_PER_PAGE = 2;

export function AdminUsuarios() {
  const { user: currentUser, updateUser } = usePortal();
  const [users, setUsers] = useState<User[]>([]);
  const [structure, setStructure] = useState<AcademicStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>("aluno");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const message = (err: unknown) =>
    err instanceof Error
      ? err.message
      : "Não foi possível concluir a operação.";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [items, academic] = await Promise.all([
        api.users(),
        api.academicStructure(),
      ]);
      setUsers(items);
      setStructure(academic);
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const filtered = users.filter(
    (item) =>
      (!filter || item.role === filter) &&
      `${item.name} ${item.email} ${item.className ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  const activePage = Math.min(page, pages);
  const firstUser = (activePage - 1) * USERS_PER_PAGE;

  function edit(item: User | null) {
    setEditing(item);
    setRole(item?.role ?? "aluno");
    setOpen(true);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const payload = {
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      role,
      classGroupId:
        role === "aluno"
          ? String(data.get("classGroupId") ?? "") || null
          : null,
      ...(password ? { password } : {}),
    };
    setBusy(true);
    try {
      const saved = editing?.id
        ? await api.updateUser(editing.id, payload)
        : await api.createUser({ ...payload, password });
      setUsers((items) =>
        [...items.filter((item) => item.id !== saved.id), saved].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        ),
      );
      if (saved.id === currentUser.id) updateUser(saved);
      setOpen(false);
      toast.success(editing ? "Usuário atualizado." : "Usuário cadastrado.");
    } catch (err) {
      toast.error(message(err));
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: User) {
    if (
      !item.id ||
      !(await confirmarComToast(
        `Excluir a conta de ${item.name} (${item.email})? Esta ação não pode ser desfeita.`,
        "Excluir usuário",
      ))
    )
      return;
    setBusy(true);
    try {
      await api.deleteUser(item.id);
      setUsers((items) => items.filter((user) => user.id !== item.id));
      toast.success("Usuário excluído.");
    } catch (err) {
      toast.error(message(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-4">
      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="form-title">Gestão de usuários</h2>
            <p className="text-sm text-slate-400">
              Cadastre, consulte, edite e exclua administradores, professores e
              alunos.
            </p>
          </div>
          <Button
            className="bg-primary text-white"
            disabled={loading || !!error || busy}
            onClick={() => edit(null)}
          >
            Novo usuário
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Buscar por nome, e-mail ou turma">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Filtrar por perfil">
            <Select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos os perfis</option>
              {(["admin", "professor", "aluno"] as const).map((value) => (
                <option key={value} value={value}>
                  {roleNames[value]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Panel>
      {open && (
        <Panel className="p-5">
          <h2 className="form-title">
            {editing ? "Editar usuário" : "Cadastrar usuário"}
          </h2>
          <form
            key={editing?.id ?? "new"}
            onSubmit={save}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Nome completo">
              <Input
                name="name"
                required
                pattern=".*\S.*"
                defaultValue={editing?.name}
              />
            </Field>
            <Field label="E-mail">
              <Input
                name="email"
                type="email"
                required
                defaultValue={editing?.email}
              />
            </Field>
            <Field label="Perfil">
              <Select
                name="role"
                value={role}
                disabled={editing?.id === currentUser.id}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {(["admin", "professor", "aluno"] as const).map((value) => (
                  <option key={value} value={value}>
                    {roleNames[value]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={
                editing ? "Nova senha (deixe em branco para manter)" : "Senha"
              }
            >
              <Input
                name="password"
                type="password"
                minLength={5}
                required={!editing}
                autoComplete="new-password"
              />
            </Field>
            {role === "aluno" && (
              <Field label="Turma (curso e série vinculados automaticamente)">
                <Select
                  name="classGroupId"
                  defaultValue={editing?.classGroupId ?? ""}
                >
                  <option value="">Sem vínculo escolar</option>
                  {structure?.classGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            {editing && (
              <p className="text-sm text-slate-400 sm:col-span-2">
                ID: {editing.id}
                {editing.course && ` • Curso: ${editing.course.name}`}
                {editing.grade && ` • Série: ${editing.grade.name}`}
              </p>
            )}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={busy} className="bg-primary text-white">
                {busy ? "Salvando…" : "Salvar usuário"}
              </Button>
              <Button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      )}
      {loading ? (
        <p role="status">Carregando usuários…</p>
      ) : error ? (
        <Panel className="p-5">
          <p role="alert">{error}</p>
          <Button onClick={() => void load()}>Tentar novamente</Button>
        </Panel>
      ) : (
        <>
          <p className="text-sm text-slate-400">
            {filtered.length} usuário(s) encontrado(s)
          </p>
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
            {filtered
              .slice(firstUser, firstUser + USERS_PER_PAGE)
              .map((item) => (
                <Panel
                  key={item.id}
                  className="flex min-w-0 flex-col gap-4 p-5"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-semibold">
                      {item.name}
                      {item.id === currentUser.id && " (você)"}
                    </h3>
                    <p className="break-all text-sm text-slate-400">
                      {item.email}
                    </p>
                    <p className="text-sm">
                      {roleNames[item.role]}
                      {item.className && ` • ${item.className}`}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      disabled={busy}
                      onClick={() => edit(item)}
                      aria-label={`Consultar e editar ${item.name}`}
                    >
                      Consultar / editar
                    </Button>
                    <Button
                      className="bg-red-500/10 text-red-300"
                      disabled={busy || item.id === currentUser.id}
                      onClick={() => void remove(item)}
                      aria-label={`Excluir ${item.name}`}
                    >
                      Excluir
                    </Button>
                  </div>
                </Panel>
              ))}
            {!filtered.length && (
              <EmptyState
                title="Nenhum usuário encontrado"
                text="Ajuste os filtros ou cadastre um novo usuário."
              />
            )}
          </div>
          {filtered.length > 0 && (
            <nav
              className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row"
              aria-label="Paginação de usuários"
            >
              <p
                className="text-sm text-slate-400"
                role="status"
                aria-live="polite"
              >
                Exibindo {firstUser + 1}–
                {Math.min(firstUser + USERS_PER_PAGE, filtered.length)} de{" "}
                {filtered.length} usuários
              </p>
              <div className="flex items-center gap-3">
                <Button
                  disabled={activePage === 1}
                  onClick={() => setPage(activePage - 1)}
                >
                  Anterior
                </Button>
                <span>
                  Página {activePage} de {pages}
                </span>
                <Button
                  disabled={activePage === pages}
                  onClick={() => setPage(activePage + 1)}
                >
                  Próxima
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
