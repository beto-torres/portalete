import { MigrationInterface, QueryRunner } from 'typeorm';

export class AjustarRecuperacaoPorCodigo1727200000002 implements MigrationInterface {
  name = 'AjustarRecuperacaoPorCodigo1727200000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "status_solicitacao_senha_enum" ADD VALUE IF NOT EXISTS 'aprovada' BEFORE 'concluida'`);
    await queryRunner.query(`ALTER TABLE "solicitacoes_redefinicao_senha" ADD COLUMN IF NOT EXISTS "codigo_hash" varchar`);
    await queryRunner.query(`ALTER TABLE "solicitacoes_redefinicao_senha" ADD COLUMN IF NOT EXISTS "codigo_expira_em" timestamp`);
    await queryRunner.query(`ALTER TABLE "solicitacoes_redefinicao_senha" ADD COLUMN IF NOT EXISTS "aprovado_em" timestamp`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credenciais_recuperacao"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "solicitacoes_redefinicao_senha" DROP COLUMN IF EXISTS "aprovado_em"`);
    await queryRunner.query(`ALTER TABLE "solicitacoes_redefinicao_senha" DROP COLUMN IF EXISTS "codigo_expira_em"`);
    await queryRunner.query(`ALTER TABLE "solicitacoes_redefinicao_senha" DROP COLUMN IF EXISTS "codigo_hash"`);
  }
}
