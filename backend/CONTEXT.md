# CONTEXT.md — Contexto do Backend (Portal ETE)

Este arquivo fornece o panorama de contexto rápido para desenvolvimento e manutenção da API do **Portal ETE**.

---

## 1. Documentos Oficiais de Referência

* **Escopo, Módulos, Endpoints e Modelo Relacional:** Veja [`docs/SCOPE.md`](./docs/SCOPE.md).
* **Diretrizes e Regras Operacionais para Agentes de IA:** Veja [`AGENTS.md`](./AGENTS.md).
* **Guia Rápido de Execução e Docker:** Veja [`README.md`](./README.md).

---

## 2. Visão Rápida do Ecossistema

* **Stack:** NestJS 10, TypeORM 0.3, PostgreSQL 16, Passport JWT, Bcryptjs.
* **Portas Padrão:** API em `http://localhost:3001/api` e PostgreSQL em `localhost:5432`.
* **Banco de Dados:** Nomenclatura em Português do Brasil com convenção snake_case (`usuarios`, `eventos`, `horarios`, `cursos`, `series`, `turmas`, `sugestoes`, `notificacoes`).
* **Autenticação:** Baseada em Bearer Token JWT com Guards globais (`AutenticacaoGuard`, `PapeisGuard`).

---

## 3. Credenciais e Tokens Institucionais de Desenvolvimento

* **Usuários Seed padrão (senha `12345`):**
  * Administrador: `admin@etelimoeiro.com.br` (ou `admin@ete.pe.gov.br`)
  * Professor: `professor@etelimoeiro.com.br` (ou `professor@ete.pe.gov.br`)
  * Aluno: `aluno@etelimoeiro.com.br` (ou `aluno@ete.pe.gov.br`)
* **Tokens de Registro Privilegiado:**
  * Professor: `@ProfAcesso10`
  * Administrador: `@AdmAcesso10`

---

## 4. Principais Regras de Negócio Ativas

1. **Isolamento de Turmas:** Alunos só acessam horários e eventos específicos do seu curso, série e turma ou de abrangência geral da escola.
2. **Leitura Individual de Notificações:** O status de leitura de eventos e horários é gravado por usuário (`notificacoes_leituras`), impedindo que a ação de um administrador limpe o indicador de um aluno.
3. **Migrações Versionadas:** Todas as alterações de banco de dados devem ser feitas por novas migrations idempotentes em `src/migracoes/`.
