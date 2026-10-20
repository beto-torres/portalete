# Publicação do PortalETE

## Infraestrutura

- Banco novo: projeto Neon `portalete`, PostgreSQL 16, região `aws-us-east-1`.
- API NestJS: Render Free, configuração em `render.yaml`.
- Frontend Next.js: Vercel, diretório raiz `frontend`.

## API no Render

1. Conecte o repositório `beto-torres/portalete` e crie um Blueprint usando `render.yaml`.
2. Preencha `DATABASE_URL` com a conexão do novo banco Neon, mantendo TLS habilitado.
3. Preencha `FRONTEND_URL` com a URL HTTPS de produção do frontend, sem barra final.
4. O Blueprint gera JWT e códigos aleatórios para cadastro de administrador e professor.
5. Confira o deploy e `https://<api>.onrender.com/api/health`.

As migrações são executadas na inicialização. Em produção, `synchronize` fica desligado e as contas demonstrativas não são criadas. As migrações existentes incluem estrutura escolar e uma grade inicial de horários; banco novo não significa ausência desses dados iniciais.

## Frontend na Vercel

1. Importe o mesmo repositório, selecionando `frontend` como Root Directory e Next.js como framework.
2. Configure `NEXT_PUBLIC_API_URL=https://<api>.onrender.com/api` antes do build.
3. Publique e use a URL resultante como `FRONTEND_URL` no Render.
4. Ao mudar `NEXT_PUBLIC_API_URL`, refaça o deploy do frontend: essa variável é incorporada no build.

## Primeiro acesso

Cadastre o primeiro administrador pela tela de cadastro usando o valor de `ADMIN_REGISTRATION_CODE` disponível apenas nas variáveis privadas do Render. Compartilhe `TEACHER_REGISTRATION_CODE` somente com professores autorizados. Alunos continuam com cadastro sem código.

## Verificação

- Health check da API retorna `{"status":"ok"}`.
- Cadastro, login e consulta de perfil funcionam com o banco remoto.
- Cadastro de administrador com código incorreto é rejeitado.
- Confira calendário, horários, notificações e permissões de cada perfil antes do uso institucional.

## Limites e credenciais

O Render Free suspende a API após inatividade e pode demorar para responder no primeiro acesso. Confirme os limites reais no painel Neon: a conta conectada retornou limite de banco de 512 MiB na criação. A elegibilidade do Vercel Hobby deve ser conferida para uso institucional. Não há garantia de disponibilidade contínua nos planos gratuitos.

Credenciais locais de implantação ficam em `.deploy/`, ignorado pelo Git. Não envie esse diretório ao repositório. Banco local e seus dados foram preservados.
