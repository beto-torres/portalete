# PortalETE na Vercel e Neon

O frontend Next.js usa o projeto Vercel `portalete`; a API NestJS usa `portalete-api`. O banco permanece no projeto Neon `portalete` (PostgreSQL 16, aws-us-east-1).

## API

Configure em Production: DATABASE_URL (Neon com sslmode=verify-full), JWT_SECRET (aleatório, mínimo 32 caracteres), ADMIN_REGISTRATION_CODE, TEACHER_REGISTRATION_CODE e FRONTEND_URL (URL HTTPS final do frontend, sem barra final). As credenciais devem ser privadas, sem prefixo NEXT_PUBLIC_.

MIGRATIONS_RUN=false deve ser usado após preparar o banco. NODE_ENV=production e VERCEL=1 são fornecidos pela plataforma. As migrações existentes já foram aplicadas ao banco remoto. Novas migrações devem ser executadas antes de publicar código dependente delas. synchronize fica desligado em produção.

Os dados iniciais de estrutura escolar, horários e grupos de notificações foram preparados antes da publicação. Na Vercel os hooks não repetem essa preparação em cada inicialização. Contas demonstrativas não são criadas em produção.

## Frontend

Configure NEXT_PUBLIC_API_URL=https://<dominio-da-api>/api antes do build. Alterar essa variável exige novo deploy. Configure FRONTEND_URL na API com a URL pública final do frontend.

## Deploy e GitHub

Os dois projetos estão conectados ao repositório beto-torres/portalete, branch main. Um git push nessa branch dispara os deploys. Root Directory: backend para a API e frontend para o site. Para deploy manual, execute a CLI a partir da raiz do repositório, com VERCEL_PROJECT_ID e VERCEL_ORG_ID do projeto desejado; isso permite localizar corretamente a pasta configurada.

Não envie .env*, .deploy/, .vercel/, backups ou node_modules para o GitHub. Os segredos locais ficam em .deploy/, ignorado pelo Git.

## Primeiro acesso e validação

Cadastre o primeiro administrador com ADMIN_REGISTRATION_CODE. Entregue TEACHER_REGISTRATION_CODE somente a professores autorizados. Confira health check, cadastro, login, perfil, notificações e rejeição de códigos inválidos. Revise as regras de visibilidade por perfil antes do uso institucional.

Os planos gratuitos têm cotas e não garantem disponibilidade contínua. Confira os limites efetivos do Neon e o enquadramento no plano Vercel escolhido.


URLs de produção: https://portalete.vercel.app e https://portalete-api.vercel.app/api/health. Códigos privados de primeiro cadastro disponíveis localmente em .deploy/primeiro-acesso.txt.

