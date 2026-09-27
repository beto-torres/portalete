import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../comum/perfil';
import { ClassGroup, Course, SchoolGrade } from '../escola/escola.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'nome' }) name: string;
  @Column({ unique: true }) email: string;
  @Column({ name: 'senha_hash' }) passwordHash: string;
  @Column({ name: 'perfil', type: 'enum', enum: Role, enumName: 'perfil_usuario_enum', default: Role.STUDENT }) role: Role;

  @Column({ name: 'curso_id', nullable: true }) courseId?: string | null;
  @Column({ name: 'serie_id', nullable: true }) gradeId?: string | null;
  @Column({ name: 'turma_id', nullable: true }) classGroupId?: string | null;

  @ManyToOne(() => Course, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'curso_id' })
  course?: Course | null;

  @ManyToOne(() => SchoolGrade, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'serie_id' })
  grade?: SchoolGrade | null;

  @ManyToOne(() => ClassGroup, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'turma_id' })
  classGroup?: ClassGroup | null;

  @CreateDateColumn({ name: 'criado_em' }) createdAt: Date;
}
