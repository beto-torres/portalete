# PortalETE na Vercel e Neon

O frontend Next.js usa o projeto Vercel `portalete`; a API NestJS usa `portalete-api`. O banco permanece no projeto Neon `portalete` (PostgreSQL 16, aws-us-east-1). Render não é necessário.

## API

Configure em Production: DATABASE_URL (Neon com sslmode=verify-full), JWT_SECRET (aleatório, mínimo 32 caracteres), ADMIN_REGISTRATION_CODE, TEACHER_REGISTRATION_CODE e FRONTEND_URL (URL HTTPS final do frontend, sem barra final). As credenciais devem ser privadas, sem prefixo NEXT_PUBLIC_.

MIGRATIONS_RUN=false deve ser usado após preparar o banco. NODE_ENV=production e VERCEL=1 são fornecidos pela plataforma. As migrações existentes já foram aplicadas ao banco remoto. Novas migrações devem ser executadas antes de publicar código dependente delas. synchronize fica desligado em produção.

Os dados iniciais de estrutura escolar, horários e grupos de notificações foram preparados antes da publicação. Na Vercel os hooks não repetem essa preparação em cada inicialização. Contas demonstrativas não são criadas em produção.

## Frontend

Configure NEXT_PUBLIC_API_URL=https://<dominio-da-api>/api antes do build. Alterar essa variável exige novo deploy. Configure FRONTEND_URL na API com a URL pública final do frontend.

## Deploy e GitHub

Execute `vercel deploy --prod --yes` em backend e depois em frontend, com cada diretório vinculado ao respectivo projeto. GitHub não é obrigatório para deploy pela CLI. Para deploy automático, conecte beto-torres/portalete aos dois projetos e configure Root Directory como backend e frontend, respectivamente.

Não envie .env*, .deploy/, .vercel/, backups ou node_modules para o GitHub. Os segredos locais ficam em .deploy/, ignorado pelo Git.

## Primeiro acesso e validação

Cadastre o primeiro administrador com ADMIN_REGISTRATION_CODE. Entregue TEACHER_REGISTRATION_CODE somente a professores autorizados. Confira health check, cadastro, login, perfil, notificações e rejeição de códigos inválidos. Revise as regras de visibilidade por perfil antes do uso institucional.

Os planos gratuitos têm cotas e não garantem disponibilidade contínua. Confira os limites efetivos do Neon e o enquadramento no plano Vercel escolhido.
