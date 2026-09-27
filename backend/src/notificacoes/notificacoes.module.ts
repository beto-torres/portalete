import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../autenticacao/usuario.entity';
import {
  ClassGroup,
  Course,
  ScheduleItem,
  SchoolEvent,
  SchoolGrade,
} from '../escola/escola.entity';
import {
  GrupoNotificacao,
  LeituraNotificacao,
  Notificacao,
  NotificacaoGrupo,
} from './notificacao.entity';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notificacao,
      GrupoNotificacao,
      NotificacaoGrupo,
      LeituraNotificacao,
      User,
      Course,
      SchoolGrade,
      ClassGroup,
      SchoolEvent,
      ScheduleItem,
    ]),
  ],
  controllers: [NotificacoesController],
  providers: [NotificacoesService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
