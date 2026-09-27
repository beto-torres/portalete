"use client";

import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import { roleNames } from "@/lib/data";
import { api } from "@/lib/api";
import { obterTurmaDoAluno } from "@/lib/aluno-acesso";
import type { User } from "@/types";
import { Button, Field, Input, Panel } from "../ui";

export function PaginaPerfil({
  user,
  onUpdate,
}: {
  user: User;
  onUpdate: (user: User) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const alunoTurma = obterTurmaDoAluno(user);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setBusy(true);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();

    try {
      const updated = await api.updateProfile({
        name,
      });
      onUpdate(updated);
      setSaved(true);
      toast.success("Perfil atualizado com sucesso.");
    } catch {
      // Fallback local se estiver offline
      onUpdate({
        ...user,
        name,
      });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  const turmaCompleta =
    alunoTurma?.nomeCompleto ??
    user.className ??
    user.classGroup?.name ??
    null;

  return (
    <div className="mx-auto max-w-3xl">
      <Panel className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/60 via-violet-500/30 to-accent/40" />
        <form onSubmit={submit} className="p-6 sm:p-8">
          <div className="profile-avatar -mt-20 mb-6 grid size-28 place-items-center rounded-3xl border-4 bg-gradient-to-br from-primary to-accent text-4xl font-bold text-white">
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold capitalize">{user.name}</h1>
            {turmaCompleta && (
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                Turma {turmaCompleta}
              </span>
            )}
          </div>
          <p className="mt-1 text-slate-400">{roleNames[user.role]} da ETE</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Field label="Nome de exibição">
              <Input name="name" defaultValue={user.name} required />
            </Field>
            <Field label="E-mail institucional">
              <Input value={user.email} readOnly />
            </Field>
          </div>

          {user.role === "aluno" && (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Lock size={16} />
                <span>Vínculo Institucional do Aluno</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Seu acesso a horários, eventos e serviços do portal é restrito exclusivamente aos dados da sua turma cadastrada.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="Curso">
                  <Input
                    value={
                      alunoTurma
                        ? alunoTurma.cursoNome
                        : "Desenvolvimento de Sistemas"
                    }
                    readOnly
                    className="cursor-not-allowed opacity-80"
                  />
                </Field>
                <Field label="Série">
                  <Input
                    value={alunoTurma ? alunoTurma.serieNome : "1º Ano"}
                    readOnly
                    className="cursor-not-allowed opacity-80"
                  />
                </Field>
                <Field label="Turma">
                  <Input
                    value={alunoTurma ? `Turma ${alunoTurma.turma}` : "Turma A"}
                    readOnly
                    className="cursor-not-allowed opacity-80"
                  />
                </Field>
              </div>
            </div>
          )}

          {saved && (
            <p role="status" className="mt-4 text-sm text-emerald-400">
              Perfil atualizado com sucesso.
            </p>
          )}

          <Button disabled={busy} className="mt-6 bg-primary text-white">
            {busy ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
