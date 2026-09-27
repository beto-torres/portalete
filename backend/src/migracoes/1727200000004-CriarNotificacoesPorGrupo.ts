import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarNotificacoesPorGrupo1727200000004
  implements MigrationInterface
{
  name = 'CriarNotificacoesPorGrupo1727200000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "tipo_notificacao_enum" AS ENUM ('evento', 'horario');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notificacoes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "tipo" "tipo_notificacao_enum" NOT NULL,
      "titulo" varchar NOT NULL,
      "mensagem" text NOT NULL,
      "evento_id" uuid UNIQUE REFERENCES "eventos"("id") ON DELETE CASCADE,
      "horario_id" uuid UNIQUE REFERENCES "horarios"("id") ON DELETE CASCADE,
      "expira_em" timestamp,
      "criado_em" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "ck_notificacao_origem" CHECK (
        ("evento_id" IS NOT NULL AND "horario_id" IS NULL) OR
        ("evento_id" IS NULL AND "horario_id" IS NOT NULL)
      )
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "grupos_notificacao" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "codigo" varchar NOT NULL UNIQUE,
      "nome" varchar NOT NULL
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notificacoes_grupos" (
      "notificacao_id" uuid NOT NULL REFERENCES "notificacoes"("id") ON DELETE CASCADE,
      "grupo_id" uuid NOT NULL REFERENCES "grupos_notificacao"("id") ON DELETE CASCADE,
      CONSTRAINT "uq_notificacao_grupo" UNIQUE ("notificacao_id", "grupo_id"),
      PRIMARY KEY ("notificacao_id", "grupo_id")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notificacoes_leituras" (
      "notificacao_id" uuid NOT NULL REFERENCES "notificacoes"("id") ON DELETE CASCADE,
      "usuario_id" uuid NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
      "lida_em" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "uq_notificacao_leitura_usuario" UNIQUE ("notificacao_id", "usuario_id"),
      PRIMARY KEY ("notificacao_id", "usuario_id")
    )`);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_notificacoes_grupos_grupo" ON "notificacoes_grupos" ("grupo_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_notificacoes_leituras_usuario" ON "notificacoes_leituras" ("usuario_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notificacoes_leituras"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notificacoes_grupos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grupos_notificacao"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notificacoes"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tipo_notificacao_enum"`);
  }
}
