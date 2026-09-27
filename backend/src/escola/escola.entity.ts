import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { StatusSuggestion } from './escola.dto';

@Entity('cursos')
export class Course {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'nome' }) name: string;
  @Column({ name: 'sigla', unique: true }) acronym: string;
  @CreateDateColumn({ name: 'criado_em' }) createdAt: Date;
  @OneToMany(() => ClassGroup, (group) => group.course) classGroups: ClassGroup[];
}

@Entity('series')
export class SchoolGrade {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'nome' }) name: string;
  @Column({ name: 'numero' }) number: number;
  @Column({ name: 'sigla', unique: true }) acronym: string;
  @CreateDateColumn({ name: 'criado_em' }) createdAt: Date;
  @OneToMany(() => ClassGroup, (group) => group.grade) classGroups: ClassGroup[];
}

@Entity('turmas')
@Unique('uq_turma_curso_serie_letra', ['courseId', 'gradeId', 'letter'])
export class ClassGroup {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'nome' }) name: string;
  @Column({ name: 'letra' }) letter: string;
  @Column({ name: 'curso_id' }) courseId: string;
  @Column({ name: 'serie_id' }) gradeId: string;

  @ManyToOne(() => Course, (course) => course.classGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  course: Course;

  @ManyToOne(() => SchoolGrade, (grade) => grade.classGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serie_id' })
  grade: SchoolGrade;

  @CreateDateColumn({ name: 'criado_em' }) createdAt: Date;
}

@Entity('eventos')
export class SchoolEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'titulo' }) title: string;
  @Column({ name: 'data', type: 'date' }) date: string;
  @Column({ name: 'horario', type: 'time' }) time: string;
  @Column({ name: 'local' }) location: string;
  @Column({ name: 'publico_alvo' }) audience: string;
  @Column({ name: 'categoria' }) category: string;
  @Column({ name: 'descricao', type: 'text' }) description: string;
  @Column({ name: 'cor', default: '#8b5cf6' }) color: string;
  @Column({ nullable: true }) link?: string;
}

@Entity('horarios')
export class ScheduleItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'turma' }) className: string;
  @Column({ name: 'professor' }) teacher: string;
  @Column({ name: 'dia' }) day: number;
  @Column({ name: 'aula' }) lesson: number;
  @Column({ name: 'disciplina' }) subject: string;
}

@Entity('contagens_regressivas')
export class Countdown {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'titulo' }) title: string;
  @Column({ name: 'data', type: 'date' }) date: string;
  @Column({ name: 'ativo', default: true }) active: boolean;
}

@Entity('sugestoes')
export class Suggestion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'titulo' }) title: string;
  @Column({ name: 'turma' }) className: string;
  @Column({ name: 'categoria' }) category: string;
  @Column({ name: 'descricao', type: 'text' }) description: string;
  @Column({ default: StatusSuggestion.PENDING }) status: StatusSuggestion;
  @CreateDateColumn({ name: 'criado_em' }) createdAt: Date;
}
