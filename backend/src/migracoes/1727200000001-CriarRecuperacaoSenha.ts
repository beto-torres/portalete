import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarRecuperacaoSenha1727200000001 implements MigrationInterface {
  name = 'CriarRecuperacaoSenha1727200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "perfil_usuario_enum" AS ENUM ('aluno', 'professor', 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "usuarios" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "nome" varchar NOT NULL,
      "email" varchar NOT NULL UNIQUE,
      "senha_hash" varchar NOT NULL,
      "perfil" "perfil_usuario_enum" NOT NULL DEFAULT 'aluno',
      "criado_em" timestamp NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "credenciais_recuperacao" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "usuario_id" uuid NOT NULL UNIQUE REFERENCES "usuarios"("id") ON DELETE CASCADE,
      "pergunta" varchar NOT NULL,
      "resposta_hash" varchar NOT NULL,
      "atualizado_em" timestamp NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "status_solicitacao_senha_enum" AS ENUM ('pendente', 'concluida');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "solicitacoes_redefinicao_senha" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "usuario_id" uuid NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
      "motivo" text,
      "status" "status_solicitacao_senha_enum" NOT NULL DEFAULT 'pendente',
      "criado_em" timestamp NOT NULL DEFAULT now(),
      "concluido_em" timestamp
    )`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_solicitacoes_senha_usuario_status" ON "solicitacoes_redefinicao_senha" ("usuario_id", "status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "solicitacoes_redefinicao_senha"');
    await queryRunner.query('DROP TABLE IF EXISTS "credenciais_recuperacao"');
    await queryRunner.query('DROP TYPE IF EXISTS "status_solicitacao_senha_enum"');
  }
}
