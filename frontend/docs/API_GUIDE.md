# Guia de API — Portal ETE PE

Este documento registra o contrato sugerido para substituir o armazenamento local do protótipo por uma API real.

## Perfis e permissões

| Recurso | Aluno | Professor | Administrador |
| --- | --- | --- | --- |
| Consultar eventos, calendário e horários | Sim | Sim | Sim |
| Enviar sugestão | Sim | Não | Não |
| Publicar e remover eventos | Não | Sim | Sim |
| Gerenciar horários e contagens | Não | Não | Sim |
| Consultar sugestões recebidas | Não | Não | Sim |

A API deve validar o perfil em todas as operações. Ocultar um botão no frontend não é autorização.

## Endpoints sugeridos

### Sessão

- `POST /api/auth/login` — autentica por e-mail e senha.
- `POST /api/auth/logout` — encerra a sessão.
- `GET /api/auth/me` — devolve o usuário autenticado.
- `POST /api/auth/forgot-password` — solicita recuperação de senha.

### Usuários — CRUD implementado, exclusivo de administradores

- `GET /api/users` — lista usuários sem senhas ou hashes.
- `GET /api/users/:id` — consulta um usuário.
- `POST /api/users` — cria usuário com `name`, `email`, `role`, `password` e `classGroupId` opcional.
- `PATCH /api/users/:id` — altera esses campos; omitir `password` mantém a senha atual.
- `DELETE /api/users/:id` — exclui a conta e seus registros dependentes de recuperação e leitura de notificações.

Perfis aceitos: `admin`, `professor` e `aluno`. A turma determina o curso e a série; `classGroupId: null` remove o vínculo acadêmico. Perfis não estudantis não mantêm vínculo acadêmico. A API rejeita e-mails duplicados, turmas inexistentes, autoexclusão e rebaixamento do próprio administrador. O último administrador é preservado. As permissões de sessões existentes são consultadas no banco a cada requisição autenticada.

Na interface: **Administração → Usuários**, com busca, filtro de perfil e paginação. Para executar os testes de regras de negócio e autorização: `cd backend`, `npm run build` e `node --test test/usuarios.test.cjs`. Esses testes usam repositórios simulados; a integração com PostgreSQL deve ser validada em ambiente com banco disponível.

### Eventos

- `GET /api/events?status=upcoming&category=`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`

### Horários

- `GET /api/schedules?className=&teacher=`
- `POST /api/schedules`
- `PATCH /api/schedules/:id`
- `DELETE /api/schedules/:id`

A API deve impedir duas aulas para a mesma turma, dia e número da aula.

### Contagens regressivas

- `GET /api/countdowns?active=true`
- `POST /api/countdowns`
- `PATCH /api/countdowns/:id`
- `DELETE /api/countdowns/:id`

### Sugestões

- `GET /api/suggestions?status=pending`
- `POST /api/suggestions`
- `PATCH /api/suggestions/:id/status`

Status recomendados: `pending`, `reviewing`, `approved` e `rejected`.

## Regras importantes

- Datas devem usar `YYYY-MM-DD` e horários `HH:mm`.
- IDs devem ser criados pelo servidor.
- Campos textuais devem ser validados e limitados no servidor.
- Exclusões devem exigir autenticação e autorização.
- Links de eventos devem aceitar apenas `http` e `https`.
- Listagens administrativas devem ter paginação quando conectadas ao banco.
- A preferência de tema permanece no `localStorage`; não precisa ir para a API.
