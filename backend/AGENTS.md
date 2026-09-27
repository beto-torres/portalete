# AGENTS.md — Diretrizes para Agentes de IA (Backend Portal ETE)

Este documento estabelece o guia operacional obrigatório para agentes autônomos de IA (Antigravity, Codex, Cursor, Claude Code, etc.) que atuam no repositório de backend do **Portal ETE**.

Todas as instruções aqui descritas devem ser seguidas rigorosamente para preservar a integridade arquitetural, a segurança e a estabilidade do sistema.

---

## 1. Visão do Projeto & Arquitetura

O backend do Portal ETE é uma API REST corporativa/educacional construída sobre o ecossistema **NestJS 10**, **TypeORM 0.3** e **PostgreSQL 16**.

### Pilares Fundamentais
* **Nomenclatura Didática no Banco:** Todas as tabelas e colunas utilizam **Português do Brasil em snake_case** (`usuarios`, `eventos`, `horarios`, `cursos`, `series`, `turmas`, `sugestoes`, `notificacoes`). No TypeScript, as propriedades utilizam `camelCase`.
* **Módulos Bem Delimitados:**
  * `AuthModule`: Autenticação JWT, registro, perfis institucionais e redefinição de senhas com aprovação administrativa.
  * `SchoolModule`: Estrutura acadêmica, eventos, horários, contagens e ouvidoria/sugestões.
  * `NotificacoesModule`: Disparadores reativos de notificações e controle de leitura individual por usuário.
* **Segurança e RBAC:** Autenticação global via `AutenticacaoGuard` e controle de permissões por papel via `PapeisGuard` com `@Roles(...)` e `@Public()`.

---

## 2. Fluxo de Trabalho Obrigatório do Agente

Antes de alterar qualquer código:

1. **Investigação Prévia:** Localize e leia os módulos, controllers, services, DTOs e entidades envolvidos na tarefa.
2. **Avaliação de Impacto:** Verifique os contratos da API e os impactos no frontend consumidor (`frontend/src/lib/api.ts`).
3. **Plano de Ação:** Formule um raciocínio claro e realize alterações atômicas e pontuais.
4. **Validação:** Ao finalizar a alteração, sempre execute a verificação estática do TypeScript (`npx tsc --noEmit`) e teste de build.

> [!CAUTION]
> **Nunca implemente código às cegas.** Não assuma nomes de colunas ou rotas sem antes inspecionar o arquivo correspondente ou o `docs/SCOPE.md`.

---

## 3. Regras de Banco de Dados e Migrações (Invioláveis)

1. **Nunca modifique migrations antigas:**
   * As migrações existentes (`000` a `004`) já foram executadas em ambientes locais e de produção. Qualquer alteração de schema deve ser feita através de uma **nova migração versionada** em `src/migracoes/`.
2. **Idempotência Obrigatória:**
   * Sempre utilize instruções SQL defensivas: `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object ... END $$` para ENUMs.
3. **Registro Centralizado:**
   * Toda nova migração criada deve ser importada e registrada na lista `migrations` do `TypeOrmModule` em `src/aplicacao.module.ts`.
4. **Preservação de Dados:**
   * Nunca execute `DROP TABLE`, `TRUNCATE` ou remoção de colunas em migrations sem motivo justificado e aprovação explícita.
   * Não confie em `synchronize: true` para alterações estruturais destrutivas.

---

## 4. Regras de Negócio e Segurança

Ao implementar ou modificar endpoints, garanta as seguintes regras fundamentais:

### 4.1. Isolamento Estudantil (Alunos)
* Alunos têm visibilidade restrita:
  * **Eventos:** O aluno só pode visualizar eventos gerais da escola (`publico_alvo` contendo "Geral" ou "Todas as turmas") ou exclusivos do seu curso, série e turma.
  * **Horários:** O aluno só pode consultar aulas da sua própria turma (`turma_id` ou `className`).
  * **Notificações:** Alunos só recebem notificações de eventos gerais ou da sua turma, e horários de suas aulas.

### 4.2. Isolamento de Estado de Leitura de Notificações
* O status de leitura de uma notificação é **individual por usuário** (`notificacoes_leituras`).
* A leitura realizada por um Administrador ou Professor **nunca** pode marcar a notificação como lida para os alunos ou outros usuários.

### 4.3. Autorização e Tokens de Cadastro
* O cadastro com perfil `professor` exige o código de autorização `@ProfAcesso10`.
* O cadastro com perfil `admin` exige o código de autorização `@AdmAcesso10`.
* Estudantes (`aluno`) não necessitam de código de autorização, mas devem ser vinculados à sua turma quando aplicável.

---

## 5. Padrões de Código e Engenharia

* **TypeScript Estrito:** Proibido o uso de `any`. Utilize tipos explícitos, interfaces ou tipos do TypeORM/NestJS.
* **Validação por DTOs:**
  * Toda entrada de dados em controllers deve possuir um DTO com decoradores do `class-validator` (`@IsString()`, `@IsEmail()`, `@IsOptional()`, etc.).
  * Nunca receba payloads genéricos (`body: any`).
* **Tratamento de Exceções:**
  * Use as classes de exceção nativas do NestJS:
    * `NotFoundException` (recurso não encontrado);
    * `UnauthorizedException` (credenciais inválidas ou token ausente);
    * `ForbiddenException` (perfil sem permissão);
    * `BadRequestException` (dados de entrada inválidos).
* **Guards e Rotas:**
  * Por padrão, toda rota requer autenticação JWT.
  * Rotas abertas devem ser decoradas explicitamente com `@Public()`.
  * Rotas protegidas por perfil devem ser decoradas com `@Roles(Role.ADMIN, ...)`.

---

## 6. Procedimento de Teste e Validação

Após qualquer modificação no backend:

1. **Checagem de Tipos:**
   ```bash
   npx tsc --noEmit
   ```
2. **Build da Aplicação:**
   ```bash
   npm run build
   ```
3. **Verificação de Container (se Docker estiver ativo):**
   * Verifique a integridade dos containers `backend-api-1` e `backend-postgres-1`.
   * Verifique se as migrações foram executadas sem erro no log do NestJS.

---

## 7. Formato de Resposta do Agente

Ao concluir uma tarefa para o usuário:

1. **Ação Realizada:** Resumo claro e objetivo do que foi implementado ou corrigido.
2. **Arquivos Alterados:** Lista com links diretos para os arquivos modificados.
3. **Regras Preservadas:** Destaque de como as regras de negócio (isolamento de perfil, integridade relacional) foram mantidas.
4. **Validação Técnica:** Confirmação de que `tsc` e `build` passaram com 0 erros.
