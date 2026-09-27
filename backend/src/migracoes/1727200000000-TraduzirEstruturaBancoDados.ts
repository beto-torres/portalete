import { MigrationInterface, QueryRunner } from 'typeorm';

export class TraduzirEstruturaBancoDados1727200000000 implements MigrationInterface {
  name = 'TraduzirEstruturaBancoDados1727200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tabelas: Record<string, string> = {
      users: 'usuarios',
      events: 'eventos',
      schedules: 'horarios',
      countdowns: 'contagens_regressivas',
      suggestions: 'sugestoes',
    };

    for (const [antiga, nova] of Object.entries(tabelas)) {
      if (await queryRunner.hasTable(antiga) && !await queryRunner.hasTable(nova)) {
        await queryRunner.renameTable(antiga, nova);
      }
    }

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "eventos" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "titulo" varchar NOT NULL,
      "data" date NOT NULL,
      "horario" time NOT NULL,
      "local" varchar NOT NULL,
      "publico_alvo" varchar NOT NULL,
      "categoria" varchar NOT NULL,
      "descricao" text NOT NULL,
      "cor" varchar NOT NULL DEFAULT '#8b5cf6',
      "link" varchar
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "horarios" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "turma" varchar NOT NULL,
      "professor" varchar NOT NULL,
      "dia" integer NOT NULL,
      "aula" integer NOT NULL,
      "disciplina" varchar NOT NULL
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "contagens_regressivas" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "titulo" varchar NOT NULL,
      "data" date NOT NULL,
      "ativo" boolean NOT NULL DEFAULT true
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "sugestoes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "titulo" varchar NOT NULL,
      "turma" varchar NOT NULL,
      "categoria" varchar NOT NULL,
      "descricao" text NOT NULL,
      "status" varchar NOT NULL DEFAULT 'pendente',
      "criado_em" timestamp NOT NULL DEFAULT now()
    )`);

    await this.renomearColunas(queryRunner, 'usuarios', {
      name: 'nome', passwordHash: 'senha_hash', role: 'perfil', createdAt: 'criado_em',
    });
    await this.renomearColunas(queryRunner, 'eventos', {
      title: 'titulo', date: 'data', time: 'horario', location: 'local', audience: 'publico_alvo',
      category: 'categoria', description: 'descricao', color: 'cor',
    });
    await this.renomearColunas(queryRunner, 'horarios', {
      className: 'turma', teacher: 'professor', day: 'dia', lesson: 'aula', subject: 'disciplina',
    });
    await this.renomearColunas(queryRunner, 'contagens_regressivas', {
      title: 'titulo', date: 'data', active: 'ativo',
    });
    await this.renomearColunas(queryRunner, 'sugestoes', {
      title: 'titulo', className: 'turma', category: 'categoria', description: 'descricao', createdAt: 'criado_em',
    });

    await queryRunner.query(`DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum')
         AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perfil_usuario_enum') THEN
        ALTER TYPE "users_role_enum" RENAME TO "perfil_usuario_enum";
      END IF;
    END $$;`);
    if (await queryRunner.hasTable('sugestoes') && await queryRunner.hasColumn('sugestoes', 'status')) {
      await queryRunner.query(`UPDATE "sugestoes" SET "status" = 'pendente' WHERE "status" = 'pending'`);
    }
  }

  public async down(): Promise<void> {
    // A reversão não é automática para evitar a perda acidental da padronização em português.
  }

  private async renomearColunas(queryRunner: QueryRunner, tabela: string, colunas: Record<string, string>) {
    if (!await queryRunner.hasTable(tabela)) return;
    for (const [antiga, nova] of Object.entries(colunas)) {
      if (await queryRunner.hasColumn(tabela, antiga) && !await queryRunner.hasColumn(tabela, nova)) {
        await queryRunner.renameColumn(tabela, antiga, nova);
      }
    }
  }
}
