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
