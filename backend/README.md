# Portal ETE API

Backend didático em NestJS com PostgreSQL, JWT e TypeORM.

## Executar com Docker

```bash
docker compose up --build
```

A API fica em `http://localhost:3001/api` e o PostgreSQL em `localhost:5432`.

## Contas de demonstração

Todas usam a senha `12345`:

- Aluno: `aluno@ete.pe.gov.br`
- Professor: `professor@ete.pe.gov.br`
- Administrador: `admin@ete.pe.gov.br`

## Desenvolvimento sem Docker para a API

1. Copie `.env.example` para `.env`.
2. Inicie apenas o PostgreSQL com `docker compose up -d postgres`.
3. Execute `npm install` e `npm run start:dev`.

## Estrutura do banco de dados

Para facilitar o aprendizado, as tabelas e colunas usam nomes em português do Brasil:

- `usuarios`: `nome`, `email`, `senha_hash`, `perfil` e `criado_em`;
- `eventos`: `titulo`, `data`, `horario`, `local`, `publico_alvo`, `categoria`, `descricao` e `cor`;
- `horarios`: `turma`, `professor`, `dia`, `aula` e `disciplina`;
- `contagens_regressivas`: `titulo`, `data` e `ativo`;
- `sugestoes`: `titulo`, `turma`, `categoria`, `descricao`, `status` e `criado_em`.

Em uma instalação existente, a migração traduz a estrutura e preserva os dados. Em uma instalação nova, as tabelas são criadas automaticamente pelo TypeORM. Antes de publicar o sistema, desative `synchronize: true` e altere as senhas e a chave JWT.
