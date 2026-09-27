"use client";

import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { api } from "@/lib/api";
import { classes } from "@/lib/data";
import { obterTurmaDoAluno } from "@/lib/aluno-acesso";
import type { Suggestion, User } from "@/types";
import { toast } from "react-toastify";
import { Button, Field, Input, Panel, Select, Textarea } from "../ui";

interface PaginaSugestoesProps {
  setSuggestions: Dispatch<SetStateAction<Suggestion[]>>;
  user?: User;
}

export function PaginaSugestoes({
  setSuggestions,
  user,
}: PaginaSugestoesProps) {
  const [sent, setSent] = useState(false);
  const alunoTurma = obterTurmaDoAluno(user);
  const isAlunoRestrito = user?.role === "aluno" && !!alunoTurma;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const turmaSelecionada = isAlunoRestrito
      ? alunoTurma.nomeCompleto
      : String(data.get("class"));

    try {
      const createdSuggestion = await api.createSuggestion({
        title: String(data.get("title")),
        className: turmaSelecionada,
        category: String(data.get("category")),
        description: String(data.get("description")),
      });

      setSuggestions((current) => [createdSuggestion, ...current]);
      setSent(true);
      form.reset();
      toast.success("Sugestão enviada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a sugestão.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Caixa de sugestões</h1>
        <p className="page-subtitle">
          Envie sugestões de melhoria para o Grêmio Estudantil e a Direção.
        </p>
      </div>

      <Panel className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Qual é a sua ideia?">
            <Input
              name="title"
              placeholder="Ex.: Criar um clube de leitura"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sua turma">
              {isAlunoRestrito ? (
                <>
                  <input
                    type="hidden"
                    name="class"
                    value={alunoTurma.nomeCompleto}
                  />
                  <Input
                    value={`${alunoTurma.nomeCompleto} (${alunoTurma.cursoNome})`}
                    readOnly
                    className="cursor-not-allowed opacity-80"
                  />
                </>
              ) : (
                <Select
                  name="class"
                  defaultValue={
                    user?.className ?? user?.classGroup?.name ?? classes[0]
                  }
                  required
                >
                  {classes.map((className) => (
                    <option key={className}>{className}</option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Categoria">
              <Select name="category">
                <option>Eventos culturais</option>
                <option>Infraestrutura</option>
                <option>Tecnologia</option>
                <option>Ensino</option>
                <option>Outro</option>
              </Select>
            </Field>
          </div>

          <Field label="Explique melhor a sua ideia">
            <Textarea
              name="description"
              rows={4}
              placeholder="Descreva detalhes, benefícios e sugestões práticas para implementar."
              required
            />
          </Field>

          <Button className="mt-2 bg-primary text-white">
            Enviar sugestão
          </Button>

          {sent && (
            <p className="mt-2 text-sm text-emerald-400">
              Sua sugestão foi enviada para análise da administração.
            </p>
          )}
        </form>
      </Panel>
    </div>
  );
}
