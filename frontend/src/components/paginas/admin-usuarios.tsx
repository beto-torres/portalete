"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { roleNames } from "@/lib/data";
import { confirmarComToast } from "@/lib/confirmar-com-toast";
import { usePortal } from "@/contexts/portal-context";
import type { AcademicStructure, Role, User } from "@/types";
import { Button, EmptyState, Field, Input, Panel, Select } from "../ui";

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
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const activePage = Math.min(page, pages);

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
                  <option value="">Sem vínculo acadêmico</option>
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
          {filtered
            .slice((activePage - 1) * 10, activePage * 10)
            .map((item) => (
              <Panel
                key={item.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
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
                <div className="flex gap-2">
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
          {pages > 1 && (
            <nav
              className="flex items-center justify-center gap-3"
              aria-label="Paginação de usuários"
            >
              <Button
                disabled={activePage === 1}
                onClick={() => setPage(activePage - 1)}
              >
                Anterior
              </Button>
              <span>
                {activePage} de {pages}
              </span>
              <Button
                disabled={activePage === pages}
                onClick={() => setPage(activePage + 1)}
              >
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
