import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './usuario.entity';

export enum StatusSolicitacaoSenha { PENDENTE = 'pendente', APROVADA = 'aprovada', CONCLUIDA = 'concluida' }

@Entity('solicitacoes_redefinicao_senha')
export class SolicitacaoRedefinicaoSenha {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'usuario_id' }) usuarioId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'usuario_id' }) usuario: User;
  @Column({ name: 'motivo', type: 'text', nullable: true }) motivo?: string;
  @Column({ name: 'status', type: 'enum', enum: StatusSolicitacaoSenha, enumName: 'status_solicitacao_senha_enum', default: StatusSolicitacaoSenha.PENDENTE }) status: StatusSolicitacaoSenha;
  @Column({ name: 'codigo_hash', type: 'varchar', nullable: true }) codigoHash: string | null;
  @Column({ name: 'codigo_expira_em', type: 'timestamp', nullable: true }) codigoExpiraEm: Date | null;
  @CreateDateColumn({ name: 'criado_em' }) criadoEm: Date;
  @Column({ name: 'aprovado_em', type: 'timestamp', nullable: true }) aprovadoEm: Date | null;
  @Column({ name: 'concluido_em', type: 'timestamp', nullable: true }) concluidoEm: Date | null;
}
