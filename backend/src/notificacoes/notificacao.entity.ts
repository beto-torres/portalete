import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../autenticacao/usuario.entity';

export enum TipoNotificacao {
  EVENTO = 'evento',
  HORARIO = 'horario',
}

@Entity('notificacoes')
export class Notificacao {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'enum', enum: TipoNotificacao, enumName: 'tipo_notificacao_enum' }) tipo: TipoNotificacao;
  @Column({ name: 'titulo' }) title: string;
  @Column({ name: 'mensagem', type: 'text' }) message: string;
  @Column({ name: 'evento_id', type: 'uuid', nullable: true, unique: true }) eventId?: string | null;
  @Column({ name: 'horario_id', type: 'uuid', nullable: true, unique: true }) scheduleId?: string | null;
  @Column({ name: 'expira_em', type: 'timestamp', nullable: true }) expiresAt?: Date | null;
  @CreateDateColumn({ name: 'criado_em' }) createdAt: Date;
}

@Entity('grupos_notificacao')
export class GrupoNotificacao {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'codigo', unique: true }) code: string;
  @Column({ name: 'nome' }) name: string;
}

@Entity('notificacoes_grupos')
export class NotificacaoGrupo {
  @PrimaryColumn({ name: 'notificacao_id', type: 'uuid' }) notificationId: string;
  @PrimaryColumn({ name: 'grupo_id', type: 'uuid' }) groupId: string;

  @ManyToOne(() => Notificacao, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notificacao_id' })
  notification: Notificacao;

  @ManyToOne(() => GrupoNotificacao, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_id' })
  group: GrupoNotificacao;
}

@Entity('notificacoes_leituras')
export class LeituraNotificacao {
  @PrimaryColumn({ name: 'notificacao_id', type: 'uuid' }) notificationId: string;
  @PrimaryColumn({ name: 'usuario_id', type: 'uuid' }) userId: string;
  @CreateDateColumn({ name: 'lida_em' }) readAt: Date;

  @ManyToOne(() => Notificacao, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notificacao_id' })
  notification: Notificacao;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  user: User;
}
