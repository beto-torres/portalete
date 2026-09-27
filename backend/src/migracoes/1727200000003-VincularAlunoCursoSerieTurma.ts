import { MigrationInterface, QueryRunner } from 'typeorm';

export class VincularAlunoCursoSerieTurma1727200000003 implements MigrationInterface {
  name = 'VincularAlunoCursoSerieTurma1727200000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar tabela cursos
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "cursos" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "nome" varchar NOT NULL,
      "sigla" varchar NOT NULL UNIQUE,
      "criado_em" timestamp NOT NULL DEFAULT now()
    )`);

    // 2. Criar tabela series
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "series" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "nome" varchar NOT NULL,
      "numero" integer NOT NULL,
      "sigla" varchar NOT NULL UNIQUE,
      "criado_em" timestamp NOT NULL DEFAULT now()
    )`);

    // 3. Criar tabela turmas
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "turmas" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "nome" varchar NOT NULL,
      "letra" varchar NOT NULL,
      "curso_id" uuid NOT NULL REFERENCES "cursos"("id") ON DELETE CASCADE,
      "serie_id" uuid NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
      "criado_em" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "uq_turma_curso_serie_letra" UNIQUE ("curso_id", "serie_id", "letra")
    )`);

    // 4. Inserir dados padrão de cursos
    await queryRunner.query(`INSERT INTO "cursos" ("nome", "sigla") VALUES
      ('Desenvolvimento de Sistemas', 'DS'),
      ('Nutrição e Dietética', 'NUT')
    ON CONFLICT ("sigla") DO NOTHING`);

    // 5. Inserir dados padrão de series
    await queryRunner.query(`INSERT INTO "series" ("nome", "numero", "sigla") VALUES
      ('1º Ano', 1, '1º'),
      ('2º Ano', 2, '2º'),
      ('3º Ano', 3, '3º')
    ON CONFLICT ("sigla") DO NOTHING`);

    // 6. Inserir dados padrão de turmas
    await queryRunner.query(`INSERT INTO "turmas" ("nome", "letra", "curso_id", "serie_id")
      SELECT 
        s.sigla || ' ' || c.sigla || ' ' || l.letra AS nome,
        l.letra,
        c.id AS curso_id,
        s.id AS serie_id
      FROM "cursos" c
      CROSS JOIN "series" s
      CROSS JOIN (VALUES ('A'), ('B')) AS l(letra)
      ON CONFLICT ("curso_id", "serie_id", "letra") DO NOTHING`);

    // 7. Adicionar colunas de relacionamento em usuarios
    await queryRunner.query(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "curso_id" uuid REFERENCES "cursos"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "serie_id" uuid REFERENCES "series"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "turma_id" uuid REFERENCES "turmas"("id") ON DELETE SET NULL`);

    // 8. Vincular o aluno demonstrativo à turma 1º DS A
    await queryRunner.query(`UPDATE "usuarios" u
      SET 
        "curso_id" = c.id,
        "serie_id" = s.id,
        "turma_id" = t.id
      FROM "turmas" t
      JOIN "cursos" c ON c.id = t.curso_id
      JOIN "series" s ON s.id = t.serie_id
      WHERE u.email = 'aluno@etelimoeiro.com.br'
        AND c.sigla = 'DS'
        AND s.sigla = '1º'
        AND t.letra = 'A'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "turma_id"`);
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "serie_id"`);
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "curso_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "turmas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "series"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cursos"`);
  }
}
