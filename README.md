# Estrutura e execução do ambiente

Este repositório utiliza uma arquitetura dividida em três serviços executados por meio do Docker Compose:

- `frontend`: interface web desenvolvida com Next.js e React, disponível na porta `3000`.
- `api`: API REST desenvolvida com NestJS, disponível na porta `3001` e com rotas sob o prefixo `/api`.
- `postgres`: banco de dados PostgreSQL, disponível na porta `5432`.

O Docker Compose cria uma rede interna para a comunicação entre os serviços e inicia a API somente depois que o PostgreSQL estiver saudável. Os dados do banco são mantidos no volume Docker `portalete_postgres_data`, evitando que sejam perdidos quando os contêineres forem apenas parados ou recriados.

## Tecnologias utilizadas

### Frontend

- Node.js 22
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- FullCalendar
- jsPDF
- Lucide React
- React Toastify

### Backend

- Node.js 22
- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- JWT
- bcryptjs
- class-validator e class-transformer

### Infraestrutura

- Docker
- Docker Compose
- PostgreSQL 16 Alpine

## Estrutura de diretórios

```text
portalete/
├── backend/
│   ├── src/
│   │   ├── autenticacao/   # autenticação, usuários e recuperação de senha
│   │   ├── comum/          # tipos e recursos compartilhados
│   │   ├── escola/         # recursos relacionados à estrutura escolar
│   │   ├── migracoes/      # migrações do banco de dados
│   │   ├── notificacoes/   # recursos de notificações
│   │   └── main.ts         # inicialização da API
│   ├── backups/            # backups locais do PostgreSQL
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/             # arquivos estáticos
│   ├── src/
│   │   ├── app/            # páginas e layouts do Next.js
│   │   ├── components/     # componentes da interface
│   │   ├── contexts/       # contextos React
│   │   ├── hooks/          # hooks reutilizáveis
│   │   ├── lib/            # funções auxiliares e acesso à API
│   │   └── types/          # tipos TypeScript
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # configuração dos serviços
└── README.md
```

## Pré-requisito obrigatório

O projeto necessita do **Docker** para funcionar.

Instale uma das opções abaixo:

- Windows ou macOS: Docker Desktop, que já inclui o Docker Compose.
- Linux: Docker Engine com o plugin Docker Compose.

Após a instalação, abra o Docker Desktop e aguarde até que o mecanismo do Docker esteja em execução. No terminal, confirme a instalação:

```bash
docker --version
docker compose version
```

Os dois comandos devem exibir suas respectivas versões. Não é necessário instalar Node.js, npm ou PostgreSQL diretamente no computador, pois todos eles são fornecidos pelos contêineres.

## Primeira execução

### 1. Obtenha o código

Clone o repositório e entre na pasta que contém o arquivo `docker-compose.yml`:

```bash
git clone <URL_DO_REPOSITORIO>
cd portalete
```

Se o código foi recebido em um arquivo compactado, extraia-o e abra um terminal dentro da pasta `portalete`.

### 2. Verifique se as portas estão disponíveis

O ambiente utiliza as seguintes portas do computador:

- `3000`: frontend
- `3001`: API
- `5432`: PostgreSQL

Feche qualquer aplicação que esteja usando essas portas antes de continuar.

### 3. Construa e inicie os serviços

Na raiz do repositório, execute:

```bash
docker compose up --build
```

Na primeira execução, o Docker baixará as imagens necessárias, instalará as dependências e construirá o frontend e o backend. Esse processo pode levar alguns minutos.

Mantenha esse terminal aberto. Quando os serviços terminarem de iniciar, acesse:

- Frontend: http://localhost:3000
- API: http://localhost:3001/api

As migrações do banco de dados são executadas automaticamente durante a inicialização da API.

### 4. Executar em segundo plano

Para deixar os serviços em execução sem manter os logs presos ao terminal, interrompa o comando anterior com `Ctrl+C` e execute:

```bash
docker compose up -d
```

Para visualizar os logs posteriormente:

```bash
docker compose logs -f
```

Pressione `Ctrl+C` para sair da visualização dos logs. Isso não interrompe os contêineres iniciados em segundo plano.

## Comandos úteis

### Verificar o estado dos serviços

```bash
docker compose ps
```

Os serviços devem aparecer como ativos. O PostgreSQL também deve apresentar o estado `healthy`.

### Reiniciar os serviços

```bash
docker compose restart
```

### Parar o ambiente

```bash
docker compose down
```

Esse comando remove os contêineres e a rede, mas preserva os dados armazenados no volume do PostgreSQL.

### Reconstruir após alterações nas dependências

Se algum `package.json`, `package-lock.json` ou `Dockerfile` for alterado, execute:

```bash
docker compose up --build
```

### Apagar todo o banco local e começar novamente

> Atenção: o comando abaixo exclui definitivamente todos os dados armazenados no banco local.

```bash
docker compose down -v
docker compose up --build
```

## Configuração do ambiente Docker

As variáveis usadas pelos contêineres estão definidas no `docker-compose.yml`.

| Serviço | Variável | Valor de desenvolvimento |
|---|---|---|
| PostgreSQL | `POSTGRES_DB` | `portalete` |
| PostgreSQL | `POSTGRES_USER` | `portalete` |
| PostgreSQL | `POSTGRES_PASSWORD` | `portalete` |
| API | `PORT` | `3001` |
| API | `DATABASE_URL` | conexão interna com o serviço `postgres` |
| API | `JWT_SECRET` | chave de desenvolvimento |
| API | `FRONTEND_URL` | `http://localhost:3000` |
| Frontend | `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |

Os valores atuais são destinados ao ambiente local. Antes de uma publicação em produção, altere as credenciais do banco, a chave JWT e as URLs conforme o ambiente de destino.

## Solução de problemas

### O comando `docker` não é reconhecido

Instale o Docker Desktop ou o Docker Engine e reinicie o terminal. No Windows e no macOS, confirme também que o Docker Desktop está aberto.

### Uma porta já está sendo usada

Encerre o programa que utiliza a porta indicada no erro ou altere o mapeamento correspondente no `docker-compose.yml`.

### A aplicação não abriu após a construção

Confira o estado e os logs:

```bash
docker compose ps
docker compose logs -f
```

Para analisar apenas um serviço, use um destes comandos:

```bash
docker compose logs -f frontend
docker compose logs -f api
docker compose logs -f postgres
```

### Alterações no código não apareceram

Reconstrua as imagens:

```bash
docker compose down
docker compose up --build
```
