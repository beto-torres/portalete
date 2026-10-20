"use client";

import { useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import type { Role } from "@/types";
import { api } from "@/lib/api";
import { Button, Field, Input, Panel, Select } from "./ui";
import { ProjectFooter } from "./project-footer";

type Mode = "login" | "register" | "forgot";

export function AuthScreen({
  onLogin,
  onRegister,
}: {
  onLogin: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<void>;
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    authorizationCode?: string;
    curso?: string;
    serie?: string;
    turma?: string;
  }) => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [selectedRole, setSelectedRole] = useState<Role>("aluno");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<"request" | "code">(
    "request",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const data = new FormData(event.currentTarget);
    if (mode === "forgot") {
      const email = String(data.get("email"));
      setBusy(true);
      try {
        if (recoveryStep === "request") {
          const result = await api.requestPasswordReset(
            email,
            String(
              data.get("reason") ||
                "Solicitação enviada pela tela de recuperação.",
            ),
          );
          setMessage(
            `${result.message} Após a aprovação, informe aqui o código recebido.`,
          );
          setRecoveryStep("code");
        } else {
          const result = await api.resetPasswordWithCode(
            email,
            String(data.get("code")),
            String(data.get("newPassword")),
          );
          setMessage(result.message);
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível recuperar a senha.",
        );
      } finally {
        setBusy(false);
      }
      return;
    }
    if (mode === "register") {
      const role = selectedRole;
      const token = String(data.get("token") ?? "");
      const curso = String(data.get("curso") ?? "");
      const serie = String(data.get("serie") ?? "");
      const turma = String(data.get("turma") ?? "");
      if (
        (role === "professor" && token !== "@ProfAcesso10") ||
        (role === "admin" && token !== "@AdmAcesso10")
      ) {
        setMessage("Código de autorização inválido.");
        return;
      }
      setBusy(true);
      try {
        await onRegister({
          name: String(data.get("name")),
          email: String(data.get("email")),
          password: String(data.get("password")),
          role,
          authorizationCode: token || undefined,
          curso: role === "aluno" ? curso : undefined,
          serie: role === "aluno" ? serie : undefined,
          turma: role === "aluno" ? turma : undefined,
        });
        setMessage("Conta criada. Agora faça seu login.");
        setMode("login");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a conta.",
        );
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    try {
      await onLogin(
        String(data.get("email")),
        String(data.get("password")),
        data.get("remember") === "on",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível entrar.",
      );
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "login"
      ? "Portal ETE"
      : mode === "register"
        ? "Criar conta"
        : "Recuperar senha";
  const subtitle =
    mode === "login"
      ? "Acesso exclusivo à comunidade escolar"
      : mode === "register"
        ? "Junte-se ao Portal ETE"
        : recoveryStep === "request"
          ? "Solicite a aprovação do administrador"
          : "Use o código temporário recebido";

  return (
    <>
    <main className="auth-shell">
      <div className="orb left-[8%] top-[12%] bg-primary/30" />
      <div className="orb bottom-[8%] right-[8%] bg-accent/20" />
      <Panel className="relative z-10 w-full max-w-md p-7 sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-neon">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          {mode === "register" && (
            <Field label="Nome completo">
              <div className="field-wrap">
                <UserRound />
                <Input
                  name="name"
                  required
                  placeholder="Como podemos chamar você?"
                />
              </div>
            </Field>
          )}
          <Field label="E-mail">
            <div className="field-wrap">
              <Mail />
              <Input
                name="email"
                type="email"
                required
                placeholder="voce@etelimoeiro.com.br"
              />
            </div>
          </Field>
          {mode !== "forgot" && (
            <>
              <Field label="Senha">
                <div className="field-wrap">
                  <LockKeyhole />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={5}
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    className="icon-inline"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </Field>
              {mode === "register" && (
                <Field label="Perfil">
                  <Select
                    name="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                  >
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Administrador</option>
                  </Select>
                </Field>
              )}
              {mode === "register" && selectedRole === "aluno" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Curso">
                    <Select name="curso" defaultValue="DS">
                      <option value="DS">DS (Sistemas)</option>
                      <option value="NUT">NUT (Nutrição)</option>
                    </Select>
                  </Field>
                  <Field label="Série">
                    <Select name="serie" defaultValue="1º">
                      <option value="1º">1º Ano</option>
                      <option value="2º">2º Ano</option>
                      <option value="3º">3º Ano</option>
                    </Select>
                  </Field>
                  <Field label="Turma">
                    <Select name="turma" defaultValue="A">
                      <option value="A">Turma A</option>
                      <option value="B">Turma B</option>
                    </Select>
                  </Field>
                </div>
              )}
              {mode === "register" && selectedRole !== "aluno" && (
                <Field label="Código de autorização (equipe escolar)">
                  <Input
                    name="token"
                    type="password"
                    placeholder="Código de acesso para equipe escolar"
                    required
                  />
                </Field>
              )}
            </>
          )}
          {mode === "forgot" && recoveryStep === "request" && (
            <Field label="Observação opcional">
              <Input
                name="reason"
                placeholder="Informe algo que ajude o administrador"
              />
            </Field>
          )}
          {mode === "forgot" && recoveryStep === "code" && (
            <>
              <Field label="Código temporário">
                <Input
                  name="code"
                  required
                  minLength={6}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
              </Field>
              <Field label="Nova senha">
                <Input
                  name="newPassword"
                  type="password"
                  required
                  minLength={5}
                />
              </Field>
            </>
          )}
          {mode === "login" && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  name="remember"
                  type="checkbox"
                  className="accent-violet-500"
                />{" "}
                Lembrar de mim
              </label>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setMode("forgot");
                  setMessage("");
                }}
              >
                Esqueceu a senha?
              </button>
            </div>
          )}
          {message && (
            <p
              role="status"
              className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-violet-200"
            >
              {message}
            </p>
          )}
          <Button
            disabled={busy}
            className="mt-2 bg-gradient-to-r from-primary to-accent text-white shadow-neon hover:-translate-y-0.5"
          >
            {busy
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar no sistema"
                : mode === "register"
                  ? "Finalizar cadastro"
                  : recoveryStep === "request"
                    ? "Solicitar recuperação"
                    : "Redefinir senha"}
          </Button>
          {mode === "forgot" && (
            <button
              type="button"
              className="link text-sm"
              onClick={() => {
                setRecoveryStep((step) =>
                  step === "request" ? "code" : "request",
                );
                setMessage("");
              }}
            >
              {recoveryStep === "request"
                ? "Já recebeu um código temporário?"
                : "Ainda não possui um código? Solicitar recuperação"}
            </button>
          )}
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          {mode === "login" ? (
            <>
              Ainda não tem acesso?{" "}
              <button
                className="link"
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
              >
                Crie sua conta
              </button>
            </>
          ) : (
            <>
              Já possui conta?{" "}
              <button
                className="link"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Faça login
              </button>
            </>
          )}
        </p>
      </Panel>
    </main>
    <ProjectFooter />
    </>
  );
}
