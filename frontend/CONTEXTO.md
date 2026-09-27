# CONTEXTO.md — Documentação Técnica do Frontend (Portal ETE)

Documento oficial de contexto técnico, arquitetura, módulos, componentes, regras de negócio e fluxos da aplicação frontend do **Portal ETE** (Escola Técnica Estadual).

Este documento reflete estritamente o código-fonte implementado no repositório `frontend` e serve como referência central para desenvolvedores e agentes de IA antes de qualquer alteração.

---

## 1. Visão Geral e Propósito

O frontend do **Portal ETE** é uma Single Page Application (SPA) responsiva desenvolvida sobre o framework **Next.js** (App Router), projetada para centralizar a rotina acadêmica, pedagógica e de comunicação de uma Escola Técnica Estadual.

### Objetivos do Sistema
* **Atendimento Multiperfil:** Fornecer interfaces dedicadas e adaptadas para três papéis de usuários: **Alunos**, **Professores** e **Administradores**.
* **Isolamento Estudantil Rigoroso:** Garantir que o estudante visualize estritamente os dados associados à sua turma, série e curso (grade horária exclusiva e eventos pertinentes), preservando a visualização de comunicados gerais da escola.
* **Resiliência e Continuidade Operacional (Dual-Mode):** Operar prioritariamente consumindo a API REST do backend (`http://localhost:3001/api`), com capacidade nativa de fallback offline em `sessionStorage` e dados mockados quando o backend estiver indisponível, sem interromper a navegação do usuário.
* **Comunicação Ativa e Ouvidoria:** Prover mural de avisos e eventos paginado, calendário interativo, canal de envio de sugestões estudantis ao Grêmio e Direção, e central de notificações com controle de leitura individual por usuário.

---

## 2. Stack Tecnológica e Dependências

A aplicação foi desenvolvida com base no ecossistema moderno de React e Next.js, utilizando tipagem estrita com TypeScript e estilização utilitária.

### Dependências Principais (`package.json`)
* **Linguagem & Plataforma:** Node.js (>= 20) com **TypeScript 5.7.0**.
* **Framework Principal:** **Next.js 15.5.0** (App Router) e **React 19.1.0** / **React DOM 19.1.0**.
* **Estilização e Design System:**
  * **Tailwind CSS 3.4.17** com plugin PostCSS (`postcss 8.4.49`, `tailwindcss 3.4.17`).
  * Paleta de cores institucional com tema escuro padrão (`bg-ink`, `bg-panel`, bordas translúcidas `border-white/10`) e suporte a tema claro alternável (`.light`).
  * **Lucide React 0.468.0**: Biblioteca de ícones vetoriais.
* **Calendário Interativo:**
  * `@fullcalendar/core 6.1.19`, `@fullcalendar/daygrid 6.1.19` e `@fullcalendar/react 6.1.19` com suporte ao locale pt-BR.
* **Geração e Exportação de Relatórios:**
  * **jsPDF 4.2.1** e **jspdf-autotable 5.0.8**: Renderização client-side do horário semanal em PDF (tamanho A4 paisagem, com logo institucional e cabeçalho customizado).
* **Notificações em Interface (Feedback):**
  * **React-Toastify 11.1.0**: Emissão de alertas toast e renderização de diálogos assíncronos customizados de confirmação (`confirmarComToast`).
* **Verificação Estática e Linting:**
  * ESLint 9.17.0 com `eslint-config-next 15.5.0`.

---

## 3. Arquitetura e Padrões de Projeto

A arquitetura do frontend é organizada em camadas claras de apresentação, estado, regras de negócio e integração de rede:

```
┌─────────────────────────────────────────────────────────────┐
│                    Rotas Next.js App Router                 │
│         / (Entrada)  |  /portal/* (Páginas Internas)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     PortalArea (Guardião)                   │
│   - Validação de sessão (useSession)                        │
│   - Controle de acesso por perfil (RBAC)                    │
│   - Carregamento e resiliência de dados (usePortalData)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│        PortalContext         │        │         PortalLayout         │
│  - user, events, schedule,   │        │  - Sidebar (Navegação lateral│
│    countdowns, suggestions,  │        │  - PortalHeader (Busca, tema │
│    navigate, updateUser      │        │    e notificações ativas)    │
└──────────────────────────────┘        └──────────────────────────────┘
        │                                             │
        ▼                                             ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│      Páginas e Módulos       │        │     Camada de Dados & API    │
│  - Início, Horários,         │        │  - api.ts (HTTP Fetch / JWT) │
│    Calendário, Eventos,      │◄───────┤  - aluno-acesso.ts (Regras)  │
│    Sugestões, Administração, │        │  - useNotifications (Polling)│
│    Meu Perfil                │        │  - useStoredState (Cache)    │
└──────────────────────────────┘        └──────────────────────────────┘
```

### Padrões Arquiteturais Adotados
1. **Guardião Central de Rotas (`PortalArea`):**
   * Toda a área logada (`/portal/*`) é interceptada por `PortalArea`.
   * Enquanto a sessão é resolvida (`session.ready === false`), exibe `<LoadingScreen />`.
   * Se o usuário não estiver autenticado, exibe a tela de login/cadastro/recuperação (`<AuthScreen />`).
   * Aplica verificação estrita de papéis: impede que alunos acessem `/portal/admin` e impede que docentes ou administradores acessem `/portal/sugestoes`, exibindo a tela informativa `<StatusScreen />` com botão de retorno.
2. **Dual-Mode / Resiliência a Falhas de Conexão:**
   * O hook `usePortalData` tenta carregar os dados em paralelo da API (`Promise.all`).
   * Se houver falha de rede ou indisponibilidade do backend, a aplicação captura o erro, emite um aviso no topo do painel (`"API indisponível: exibindo os dados salvos neste navegador."`) e utiliza os dados persistidos em `sessionStorage` ou os mocks padrão (`initialEvents`, `initialSchedule`, `initialCountdowns`).
3. **Diálogos de Confirmação Não-Bloqueantes (`confirmarComToast`):**
   * Ações destrutivas (exclusão de eventos, horários, contagens ou sugestões) não utilizam `window.confirm` síncrono. Utilizam o helper `confirmarComToast(mensagem, textoBotao)`, que retorna uma `Promise<boolean>` integrada ao React-Toastify.
4. **Isolamento de Notificações por Usuário:**
   * O hook `useNotifications` realiza polling a cada 30 segundos e escuta o evento de foco na janela (`window.focus`).
   * As marcações de leitura (`markAsRead` e `markAllAsRead`) sincronizam com os endpoints `PATCH /notifications/:id/read` e `PATCH /notifications/read-all`, mantendo os estados de não lidas e zerando o badge numérico exclusivamente para o usuário logado.
5. **Prevenção de Flickeamento de Tema:**
   * O arquivo `src/app/layout.tsx` injeta um script síncrono no `<body>` antes da hidratação para ler a chave `portal-ete-theme` do `localStorage` e aplicar a classe `light` imediatamente no `document.documentElement` caso o tema claro esteja selecionado (o padrão do sistema é escuro).

---

## 4. Estrutura de Pastas e Arquivos

```
frontend/
├── public/
│   └── imagens/
│       └── ete-logo.png            # Logotipo oficial utilizado no cabeçalho dos PDFs
├── src/
│   ├── app/                        # Estrutura de rotas do Next.js (App Router)
│   │   ├── globals.css             # Estilos globais, variáveis de tema e utilitários Tailwind
│   │   ├── layout.tsx              # RootLayout com injeção de tema e ToastProvider
│   │   ├── page.tsx                # Rota pública raiz (/) -> PaginaEntrada
│   │   └── portal/                 # Grupo de rotas autenticadas do portal
│   │       ├── layout.tsx          # Wrapper que engloba as páginas no PortalArea
│   │       ├── page.tsx            # /portal -> PaginaInicio
│   │       ├── admin/page.tsx      # /portal/admin -> PaginaAdministracao
│   │       ├── calendario/page.tsx # /portal/calendario -> PaginaCalendario
│   │       ├── eventos/page.tsx    # /portal/eventos -> PaginaEventos
│   │       ├── horarios/page.tsx   # /portal/horarios -> PaginaHorarios
│   │       ├── perfil/page.tsx     # /portal/perfil -> PaginaPerfil
│   │       └── sugestoes/page.tsx  # /portal/sugestoes -> PaginaSugestoes
│   ├── components/                 # Componentes reutilizáveis e telas da aplicação
│   │   ├── auth-screen.tsx         # Tela unificada de autenticação (Login, Cadastro e Recuperação)
│   │   ├── sidebar.tsx             # Menu lateral com links contextuais por papel de usuário
│   │   ├── toast-provider.tsx      # Configuração do ToastContainer do React-Toastify
│   │   ├── ui.tsx                  # Primitivas de UI (Panel, Button, Input, Select, Textarea, Field, EmptyState)
│   │   ├── paginas/                # Componentes que contêm o conteúdo e lógica das telas
│   │   │   ├── administracao.tsx   # Painel administrativo (Abas: Eventos, Horários, Contagens, Sugestões, Senhas)
│   │   │   ├── calendario.tsx      # Calendário mensal com eventos renderizados via FullCalendar
│   │   │   ├── entrada.tsx         # Tratamento da rota raiz (/): redireciona se logado ou exibe AuthScreen
│   │   │   ├── eventos.tsx         # Mural de eventos paginado (6/pág) com busca e filtros
│   │   │   ├── horarios.tsx        # Grade semanal de aulas (9 tempos x 5 dias) com exportação PDF
│   │   │   ├── inicio.tsx          # Dashboard inicial com métricas, atalhos, contagens e próximos eventos
│   │   │   ├── perfil.tsx          # Visualização de dados do usuário e edição de nome
│   │   │   └── sugestoes.tsx       # Formulário de envio de ideias para o Grêmio/Direção
│   │   └── portal/                 # Componentes de infraestrutura da área autenticada
│   │       ├── loading-screen.tsx  # Tela de carregamento exibida durante resolução de sessão
│   │       ├── portal-area.tsx     # Guardião de rotas, controle de acesso e provedor de contexto
│   │       ├── portal-header.tsx   # Cabeçalho com busca de rotas, alternador de tema e popover de notificações
│   │       ├── portal-layout.tsx   # Layout de casca que monta Sidebar + Header + Container principal
│   │       └── status-screen.tsx   # Tela de bloqueio/aviso de acesso negado ou sessão existente
│   ├── contexts/
│   │   └── portal-context.tsx      # React Context que distribui o estado do portal para as páginas
│   ├── hooks/                      # Custom hooks React
│   │   ├── use-notifications.ts    # Polling periódico e controle de leitura de notificações
│   │   ├── use-portal-data.ts      # Carregamento central de dados com resiliência e fallback
│   │   ├── use-session.ts          # Gerenciamento de sessão, token JWT e persistência do usuário
│   │   ├── use-stored-state.ts     # Hook genérico de estado com sincronização em sessionStorage
│   │   └── use-theme.ts            # Gerenciamento e persistência do tema (dark/light)
│   ├── lib/                        # Utilitários, serviços e mocks
│   │   ├── aluno-acesso.ts         # Regras de negócio de isolamento de turma, série e curso para alunos
│   │   ├── api.ts                  # Cliente HTTP Fetch centralizado com tratamento de Bearer Token
│   │   ├── confirmar-com-toast.tsx # Utilitário de confirmação destrutiva assíncrona com Toast
│   │   ├── data.ts                 # Mocks iniciais de classes, professores, eventos e horários
│   │   ├── gerar-pdf-horario.ts    # Geração de PDF do horário escolar via jsPDF e jsPDF-AutoTable
│   │   └── utils.ts                # Utilitários auxiliares de formatação de data
│   └── types/                      # Definições de tipos TypeScript
│       ├── css.d.ts                # Declaração de módulos de folha de estilo
│       └── index.ts                # Interfaces de modelos de dados, perfis, rotas e notificações
├── package.json                    # Dependências e scripts do projeto
├── tsconfig.json                   # Configurações do compilador TypeScript
├── tailwind.config.ts              # Configuração do Tailwind CSS (cores customizadas, sombras neon)
└── postcss.config.mjs              # Configuração do PostCSS
```

---

## 5. Modelos de Dados e Tipos (`src/types/index.ts`)

Abaixo estão os modelos TypeScript implementados no frontend:

```typescript
// Papéis de usuário suportados
export type Role = "aluno" | "professor" | "admin";

// Identificadores de telas/visões do portal
export type View = "inicio" | "perfil" | "horarios" | "calendario" | "eventos" | "sugestoes" | "admin";

// Estrutura acadêmica institucional
export interface Course {
  id: string;
  name: string;
  acronym: string; // Ex.: "DS", "NUT"
}

export interface SchoolGrade {
  id: string;
  name: string;
  number: number;
  acronym: string; // Ex.: "1º", "2º", "3º"
}

export interface ClassGroup {
  id: string;
  name: string; // Ex.: "2º DS A"
  letter: string; // Ex.: "A", "B"
  courseId: string;
  gradeId: string;
  course?: Course;
  grade?: SchoolGrade;
}

export interface AcademicStructure {
  courses: Course[];
  grades: SchoolGrade[];
  classGroups: ClassGroup[];
}

// Usuário autenticado
export interface User {
  id?: string;
  name: string;
  email: string;
  role: Role;
  courseId?: string | null;
  gradeId?: string | null;
  classGroupId?: string | null;
  course?: Course | null;
  grade?: SchoolGrade | null;
  classGroup?: ClassGroup | null;
  className?: string | null; // Suporte a formatos legados em texto (ex.: "2º DS A")
}

// Solicitação de redefinição de senha
export interface PasswordResetRequest {
  id: string;
  reason?: string;
  createdAt: string;
  user: User;
}

// Evento escolar / comunicado
export interface SchoolEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  audience: string; // Ex.: "Geral", "DS — 2º Ano — Turma A"
  category: string;
  description: string;
  color: string; // Hexadecimal (#6366f1, #10b981, etc.)
  link?: string;
}

// Contagem regressiva
export interface Countdown {
  id: string;
  title: string;
  date: string; // YYYY-MM-DDTHH:MM
  active: boolean;
}

// Ouvidoria e sugestões
export type SuggestionStatus = "pendente" | "aprovada" | "reprovada";

export interface Suggestion {
  id: string;
  title: string;
  className: string;
  category: string;
  description: string;
  status: SuggestionStatus;
  createdAt: string;
}

// Alocação de grade horária
export interface ScheduleItem {
  id: string;
  className: string; // Ex.: "1º DS A"
  teacher: string;
  day: number; // 1 (Segunda) a 5 (Sexta)
  lesson: number; // 1 a 9 (Tempos de aula)
  subject: string;
}

// Alerta do sistema de notificações
export type NotificationType = "evento" | "horario";

export interface PortalNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string | null;
  scheduleId?: string | null;
  createdAt: string;
  readAt?: string | null;
}
```

---

## 6. Autenticação, Autorização e Matriz de Permissões

### 6.1. Fluxos de Autenticação (`AuthScreen.tsx` e `use-session.ts`)

A tela de autenticação atende a três modos distintos:

1. **Login:**
   * Entradas: E-mail e Senha.
   * Opção "Lembrar meu acesso":
     * Quando marcada: token e usuário são gravados em `localStorage` (persistem entre fechamentos do navegador).
     * Quando desmarcada: gravados em `sessionStorage` (expiram ao fechar a aba).
2. **Cadastro (Registro):**
   * Todos os perfis fornecem Nome, E-mail e Senha.
   * **Aluno:** Deve selecionar Curso (`DS` ou `NUT`), Série (`1º`, `2º`, `3º`) e Turma (`A` ou `B`).
   * **Professor e Administrador:** Exigem código de autorização institucional fixado no frontend:
     * Professor: `@ProfAcesso10`
     * Administrador: `@AdmAcesso10`
3. **Recuperação de Senha (Fluxo em 2 Etapas):**
   * **Etapa 1 (Solicitação):** O usuário informa seu e-mail e justificativa. O frontend chama `POST /auth/recuperacao/solicitacoes`. O pedido entra na fila de auditoria da administração.
   * **Etapa 2 (Redefinição):** Após a aprovação presencial/administrativa, o usuário recebe um código alfanumérico de 6 caracteres. Informa e-mail, código e nova senha no formulário (`POST /auth/recuperacao/redefinir`).
4. **Encerramento de Sessão (Logout):**
   * Remove o token JWT (`portal-ete-token`), a sessão do usuário e todas as chaves operacionais e de leitura de notificações (`portal-ete-notificacoes-lidas*` e `ete-*`) de ambos os storages.

### 6.2. Matriz de Controle de Acesso por Papel (RBAC)

| Rota / Recurso | Aluno | Professor | Administrador | Comportamento no Frontend |
|---|:---:|:---:|:---:|---|
| **Início (`/portal`)** | Visualização | Visualização | Visualização | Dashboard contextualizado com boas-vindas e ações rápidas específicas por perfil. |
| **Horários (`/portal/horarios`)** | Restrito à sua turma | Total (todas as turmas) | Total (todas as turmas) | Aluno tem curso/série/turma bloqueados na interface. Docente e admin têm selects livres. |
| **Calendário (`/portal/calendario`)** | Filtrado por turma | Total (todos os eventos) | Total (todos os eventos) | Aluno só vê eventos gerais ou destinados à sua turma/curso/série. |
| **Eventos (`/portal/eventos`)** | Filtrado por turma | Total (todos os eventos) | Total (todos os eventos) | Aluno visualiza apenas eventos pertinentes. Paginação de 6 eventos por página. |
| **Sugestões (`/portal/sugestoes`)** | Acesso Total (Envio) | Bloqueado | Bloqueado | Exclusivo para estudantes. Demais papéis são barrados pelo guardião `PortalArea`. |
| **Admin (`/portal/admin`)** | Bloqueado | Parcial (Aba Eventos) | Total (Todas as 5 abas) | Aluno é barrado pelo guardião. Professor só vê aba Eventos. Admin gerencia tudo. |
| **Meu Perfil (`/portal/perfil`)** | Acesso Total | Acesso Total | Acesso Total | Permite editar nome de exibição. Exibe vínculos de turma (somente leitura para alunos). |

---

## 7. Regras de Negócio Implementadas

### 7.1. Isolamento Estudantil (`src/lib/aluno-acesso.ts`)
* **Detecção e Normalização da Turma (`obterTurmaDoAluno`):**
  * Extrai a identificação da turma do usuário tanto a partir de objetos estruturados relacionais (`user.course`, `user.grade`, `user.classGroup`) quanto de strings de texto legadas (`user.className`).
  * Normaliza siglas removendo acentuações, símbolos ordinais (`º`, `°`) e hífens. Exemplo: `"2º DS A"` -> sigla normalizada `"2DSA"`.
* **Restrição de Horários (`alunoPodeAcessarHorario`):**
  * Um item da grade horária só é exibido ao aluno se o campo `className` do horário corresponder exatamente à sigla ou nome da turma do estudante.
* **Restrição de Eventos (`alunoPodeAcessarEvento`):**
  * Se o campo `audience` (público-alvo) for vazio ou contiver `"Geral"`, qualquer usuário pode visualizá-lo.
  * Caso possua restrições, o frontend avalia de forma independente três dimensões:
    1. **Curso:** Avalia menções a "DS" / "Desenvolvimento de Sistemas" ou "NUT" / "Nutrição". Evento direcionado exclusivamente a um curso bloqueia alunos do outro.
    2. **Série/Ano:** Avalia restrições a 1º, 2º ou 3º ano.
    3. **Turma/Letra:** Avalia restrições a Turma A ou Turma B.

### 7.2. Sistema de Notificações com Isolamento de Leitura
* **Geração:** Alertas são criados no backend quando eventos ou horários são cadastrados.
* **Consumo e Polling:** O frontend consulta `GET /notifications` a cada 30 segundos.
* **Isolamento de Leitura Individual:**
  * O estado de leitura (`readAt`) é vinculado à conta do usuário autenticado.
  * O botão "Marcar todas como lidas" no cabeçalho chama `PATCH /notifications/read-all`, zerando o contador de não lidas e exibindo a tag visual de "Lidas" sem afetar a contagem de outros usuários ou perfis.
* **Navegação Direta:** Ao clicar em uma notificação de evento ou horário, o frontend marca o item como lido e redireciona automaticamente o usuário para a página correspondente (`/portal/eventos` ou `/portal/horarios`).

### 7.3. Grade Horária Semanal e Exportação em PDF (`src/lib/gerar-pdf-horario.ts`)
* **Estrutura da Grade:** 5 dias da semana (Segunda a Sexta-feira) e 9 tempos de aula:
  * 1º tempo: 07:30 - 08:15
  * 2º tempo: 08:15 - 09:00
  * *Intervalo matutino (15 min)*
  * 3º tempo: 09:15 - 10:00
  * 4º tempo: 10:00 - 10:45
  * 5º tempo: 10:45 - 11:30
  * *Almoço (11:30 - 12:30)*
  * 6º tempo: 12:30 - 13:15
  * 7º tempo: 13:15 - 14:00
  * *Intervalo vespertino (15 min)*
  * 8º tempo: 14:15 - 15:00
  * 9º tempo: 15:00 - 15:45
* **Geração de PDF:** Realizada inteiramente no cliente via `jsPDF` e `jspdf-autotable`. Carrega `/imagens/ete-logo.png` em Base64, desenha faixa superior estilizada, insere cabeçalho institucional e gera a matriz semanal de disciplinas e professores em formato A4 Paisagem.

### 7.4. Mural de Eventos e Paginação de 6 Itens por Página
* As telas `PaginaEventos` e `PaginaAdministracao` (aba de eventos) implementam paginação limitando rigorosamente a exibição a **6 itens por página**.
* O gerador de páginas (`gerarNumerosDePagina`) calcula botões responsivos com reticências (`...`) para navegação em listas extensas de eventos.
* Filtros de período ("Próximos" vs. "Todos") e seleção de categorias respeitam o estado paginado, resetando o ponteiro para a página 1 ao alterar o critério de busca.

### 7.5. Ouvidoria e Sugestões dos Alunos
* Alunos preenchem título, categoria, descrição e enviam a sugestão.
* A turma do aluno é injetada automaticamente como campo fixo (`readOnly`).
* Administradores visualizam a lista com status (`pendente`, `aprovada`, `reprovada`) e podem aprovar ou reprovar cada item via `PATCH /suggestions/:id/status`.

### 7.6. Painel de Aprovação de Senhas pelo Administrador
* Administradores acompanham a fila de solicitações na aba "Senhas" em `/portal/admin`.
* Ao clicar em "Aprovar solicitação", o frontend aciona `PATCH /auth/recuperacao/solicitacoes/:id/aprovar`, recebe o código de 6 caracteres gerado pelo backend e o apresenta em destaque para que o administrador possa repassar ao solicitante.

---

## 8. Mapeamento de Rotas e Telas

| Rota Next.js | Componente de Página | Visibilidade | Descrição |
|---|---|---|---|
| `/` | `PaginaEntrada` | Pública | Ponto de entrada da aplicação. Se já houver sessão ativa, exibe opção para ir ao portal. Caso contrário, exibe o `AuthScreen`. |
| `/portal` | `PaginaInicio` | Autenticada (Todos) | Visão geral da escola: cartões de métricas, atalhos rápidos contextuais, contagens regressivas e mural dos próximos eventos. |
| `/portal/perfil` | `PaginaPerfil` | Autenticada (Todos) | Exibição de credenciais e vínculos escolares. Permite atualização do nome de cadastro do usuário. |
| `/portal/horarios` | `PaginaHorarios` | Autenticada (Todos) | Grade semanal completa de aulas. Alunos visualizam apenas sua própria turma; docentes e admin podem selecionar qualquer turma. Suporta exportação para PDF. |
| `/portal/calendario` | `PaginaCalendario` | Autenticada (Todos) | Calendário interativo em modo mês (FullCalendar) com marcação colorida dos eventos escolares e tradução em português. |
| `/portal/eventos` | `PaginaEventos` | Autenticada (Todos) | Mural completo de eventos com paginação de 6 itens por página, filtro de categoria, filtro de proximidade e links externos. |
| `/portal/sugestoes` | `PaginaSugestoes` | Autenticada (Apenas Aluno) | Formulário para submissão de sugestões de melhoria destinadas ao Grêmio e à Direção. |
| `/portal/admin` | `PaginaAdministracao` | Autenticada (Prof. / Admin) | Central de gestão com abas: Eventos (Prof. e Admin), Horários (Admin), Contagens (Admin), Sugestões (Admin) e Redefinição de Senhas (Admin). |

---

## 9. Integração com Backend e Contratos da API (`src/lib/api.ts`)

A integração HTTP é centralizada no objeto `api` através da função interna `request<T>(path, options)`. Todas as requisições autenticadas injetam o header `Authorization: Bearer <token>`.

### Mapeamento Completo de Endpoints Consumidos

| Método no Frontend | Método HTTP | Rota da API | Payload (Body) | Descrição |
|---|:---:|---|---|---|
| `api.login` | `POST` | `/auth/login` | `{ email, password }` | Autentica o usuário e retorna o token JWT e objeto do usuário. |
| `api.register` | `POST` | `/auth/register` | `{ name, email, password, role, authorizationCode?, curso?, serie?, turma? }` | Cadastra novo usuário no sistema. |
| `api.getMe` | `GET` | `/auth/me` | — | Obtém dados atualizados do usuário autenticado. |
| `api.updateProfile` | `PATCH` | `/auth/perfil` | `{ name?, courseId?, gradeId?, classGroupId?, ... }` | Atualiza dados do perfil (nome e vínculos). |
| `api.academicStructure` | `GET` | `/academic/structure` | — | Carrega árvore de cursos, séries e turmas cadastradas. |
| `api.requestPasswordReset` | `POST` | `/auth/recuperacao/solicitacoes` | `{ email, reason? }` | Solicita abertura de processo de redefinição de senha. |
| `api.resetPasswordWithCode` | `POST` | `/auth/recuperacao/redefinir` | `{ email, code, newPassword }` | Redefine a senha informando o código alfanumérico aprovado. |
| `api.passwordResetRequests` | `GET` | `/auth/recuperacao/solicitacoes` | — | Fila administrativa de solicitações de senha pendentes. |
| `api.approvePasswordReset` | `PATCH` | `/auth/recuperacao/solicitacoes/:id/aprovar` | — | Administrador aprova solicitação e obtém o código de 6 dígitos. |
| `api.events` | `GET` | `/events` | — | Lista todos os eventos cadastrados. |
| `api.createEvent` | `POST` | `/events` | `Omit<SchoolEvent, "id">` | Cadastra um novo evento no mural escolar. |
| `api.deleteEvent` | `DELETE` | `/events/:id` | — | Remove um evento existente. |
| `api.schedules` | `GET` | `/schedules` | — | Lista todos os tempos de aula da grade horária. |
| `api.createSchedule` | `POST` | `/schedules` | `Omit<ScheduleItem, "id">` | Cria ou atualiza alocação de aula na grade. |
| `api.deleteSchedule` | `DELETE` | `/schedules/:id` | — | Remove alocação de aula da grade. |
| `api.countdowns` | `GET` | `/countdowns` | — | Lista marcos temporais e contagens ativas. |
| `api.createCountdown` | `POST` | `/countdowns` | `Omit<Countdown, "id">` | Cadastra nova contagem regressiva. |
| `api.deleteCountdown` | `DELETE` | `/countdowns/:id` | — | Remove contagem regressiva existente. |
| `api.suggestions` | `GET` | `/suggestions` | — | Lista sugestões enviadas pelos alunos (acesso admin). |
| `api.createSuggestion` | `POST` | `/suggestions` | `Omit<Suggestion, "id"|"createdAt"|"status">` | Registra nova sugestão enviada por estudante. |
| `api.updateSuggestionStatus` | `PATCH` | `/suggestions/:id/status` | `{ status }` | Altera status de uma sugestão (`aprovada` ou `reprovada`). |
| `api.deleteSuggestion` | `DELETE` | `/suggestions/:id` | — | Exclui registro de sugestão. |
| `api.notifications` | `GET` | `/notifications` | — | Lista notificações destinadas ao usuário logado. |
| `api.notificationUnreadCount` | `GET` | `/notifications/unread-count` | — | Retorna contagem de notificações não lidas. |
| `api.markNotificationRead` | `PATCH` | `/notifications/:id/read` | — | Marca notificação específica como lida pelo usuário. |
| `api.markAllNotificationsRead` | `PATCH` | `/notifications/read-all` | — | Marca todas as notificações do usuário como lidas. |

---

## 10. Persistência Local e Mecanismos de Armazenamento

A aplicação utiliza `localStorage` e `sessionStorage` estrategicamente com propósitos bem definidos:

| Chave de Armazenamento | Tipo de Storage | Finalidade |
|---|:---:|---|
| `portal-ete-token` | `localStorage` ou `sessionStorage` | Token JWT de autenticação Bearer emitido pelo backend. |
| `portal-ete-session` | `sessionStorage` | Dados do usuário ativo para a sessão atual da aba. |
| `portal-ete-user` | `localStorage` | Dados do usuário preservados quando a opção "Lembrar meu acesso" está ativa. |
| `portal-ete-theme` | `localStorage` | Preferência de tema do usuário (`"dark"` ou `"light"`). Padrão: `"dark"`. |
| `ete-events` | `sessionStorage` | Cache em sessão de eventos escolares para fallback offline. |
| `ete-schedule` | `sessionStorage` | Cache em sessão da grade horária para fallback offline. |
| `ete-countdowns` | `sessionStorage` | Cache em sessão das contagens regressivas para fallback offline. |
| `ete-suggestions` | `sessionStorage` | Cache em sessão das sugestões moderadas para fallback offline. |
| `portal-ete-notificacoes-lidas:*` | `localStorage` | Identificador de chaves legadas de controle de leitura (limpas automaticamente na inicialização via `clearLegacyLocalCache`). |

---

## 11. Convenções de Código e Diretrizes para Agentes e Desenvolvedores

Ao realizar alterações ou implementar novos recursos no frontend, observe as seguintes convenções:

1. **Diretiva de Execução no Cliente:**
   * Como a aplicação funciona no modelo SPA dentro do Next.js App Router com acesso constante a APIs de navegador (`window`, `localStorage`, `sessionStorage`, `FileReader`), todos os componentes e páginas interativas devem iniciar obrigatoriamente com `"use client";`.
2. **Nomenclatura e Idioma:**
   * Nomes de arquivos de componentes em `components/paginas/` e `lib/` utilizam **kebab-case** em português (`aluno-acesso.ts`, `confirmar-com-toast.tsx`, `gerar-pdf-horario.ts`).
   * Componentes funcionais utilizam **PascalCase** (`PaginaInicio`, `PaginaEventos`, `PortalHeader`).
   * Tipos e propriedades da API seguem o padrão TypeScript definido em `types/index.ts` (`camelCase`).
3. **Respeito ao Isolamento Estudantil:**
   * Qualquer nova tela ou componente que exiba eventos, horários ou informações acadêmicas deve invocar os utilitários `alunoPodeAcessarEvento` e `alunoPodeAcessarHorario` de `@/lib/aluno-acesso` caso o usuário possua papel `aluno`.
4. **Respeito ao Design System e Componentes Base:**
   * Utilize as primitivas estilizadas em `@/components/ui`: `Panel`, `Button`, `Input`, `Select`, `Textarea`, `Field` e `EmptyState`.
   * Evite criar caixas ou botões do zero sem utilizar as classes utilitárias ou os componentes compartilhados.
5. **Ações Destrutivas:**
   * Nunca utilize `window.confirm()` ou `window.alert()`. Utilize sempre `confirmarComToast()` para confirmações e `toast.success()` / `toast.error()` para feedbacks operacionais.
6. **Integridade de Build:**
   * Antes de submeter código, execute sempre a checagem de tipos estáticos (`npx tsc --noEmit`) para evitar quebras em produção.

---

## 12. Estado Atual do Desenvolvimento

### 12.1. Funcionalidades Totalmente Implementadas
* [x] Autenticação completa (Login, Cadastro com verificação de código para prof/admin e Recuperação de senha em 2 etapas).
* [x] Sessão resiliente com persistência condicional ("Lembrar de mim").
* [x] Alternância de tema escuro e claro com prevenção de flickeamento no carregamento da página.
* [x] Central de Notificações com polling de 30s, contagem em tempo real, zeramento de badge e controle de leitura individualizado por usuário.
* [x] Mural de Eventos com paginação de 6 por página, ordenação, filtro por período (próximos/todos) e por categoria.
* [x] Grade Horária Semanal (5 dias x 9 tempos de aula) com visualização e download em PDF estilizado com logotipo da instituição.
* [x] Calendário Escolar mensal interativo em português utilizando FullCalendar.
* [x] Caixa de Sugestões estudantis com auto-preenchimento da turma do aluno e aprovação/reprovação pela administração.
* [x] Painel de Administração completo para criação, edição e exclusão de eventos, horários, contagens e aprovação de senhas com código de 6 dígitos.
* [x] Isolamento de dados de turmas e eventos para estudantes (evitando que alunos vejam dados de turmas alheias).
* [x] Sistema de fallback offline transparente com exibição de aviso visual quando a API está fora do ar.

### 12.2. Funcionalidades Parcialmente Implementadas / Observações Técnicas
* **Busca Global no Header:** O campo de pesquisa no `PortalHeader` realiza busca navegacional entre as seções e telas do portal (ex.: "Horários", "Meu perfil", "Eventos"), mas não faz busca textual profunda dentro do conteúdo dos eventos ou disciplinas da grade horária.
* **Atualização de Perfil:** A tela `/portal/perfil` permite atualizar o nome do usuário (`name`). A alteração de vínculos acadêmicos (curso, série, turma) é intencionalmente restrita para alunos (exibida como somente leitura com ícone de cadeado).

### 12.3. Funcionalidades Não Implementadas / Planejadas
* **Upload de Imagens de Eventos / Banners:** O formulário de eventos aceita cor e link externo, mas não possui campo de upload para anexar imagens personalizadas de divulgação.
* **Chat ou Mensagens Diretas:** O sistema não possui módulo de chat em tempo real entre alunos e professores.
* **Exportação em Excel / CSV:** A exportação de horários está disponível exclusivamente em formato PDF via jsPDF.

---
*Documento gerado e revisado para servir como fonte definitiva de contexto da aplicação frontend do Portal ETE.*
