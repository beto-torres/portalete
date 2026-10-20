import { MigrationInterface, QueryRunner } from 'typeorm';

// Proposta de grade: a lista de docentes não informa suas disciplinas.
export class PreencherHorario3NutA1727200000005 implements MigrationInterface {
  name = 'PreencherHorario3NutA1727200000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const disciplinas = [["Língua Portuguesa","Amanda"],["Matemática","Rinaldo"],["Biologia","Ana Paula"],["Química","Denise"],["História","Eliana"],["Física","Alberto"],["Geografia","Romildo"],["Filosofia","Emerson"],["Língua Inglesa","Lucas"],["Arte","Lídia"],["Sociologia","Jussara"],["Educação Física","Talita"]];
    const grade = [[0,0,1,1,2,2,4,8,8],[1,1,3,3,6,6,9,9,7],[0,0,5,5,2,2,10,10,11],[1,1,3,3,4,4,8,7,7],[0,0,5,5,6,6,11,11,10]];
    for (const [dia, aulas] of grade.entries()) {
      for (const [aula, indice] of aulas.entries()) {
        const [disciplina, professor] = disciplinas[indice];
        await queryRunner.query(
          `INSERT INTO horarios (id, turma, professor, dia, aula, disciplina)
           SELECT $1::uuid, $2::varchar, $3::varchar, $4::integer, $5::integer, $6::varchar
           WHERE NOT EXISTS (SELECT 1 FROM horarios WHERE turma = $2::varchar AND dia = $4::integer AND aula = $5::integer)`,
          [`3a000000-0000-4000-8000-${String(dia * 9 + aula + 1).padStart(12, '0')}`,
           '3º NUT A', professor, dia + 1, aula + 1, disciplina],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM horarios WHERE turma = $1 AND id IN (
        SELECT ('3a000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid
        FROM generate_series(1, 45) AS n)`,
      ['3º NUT A'],
    );
  }
}
