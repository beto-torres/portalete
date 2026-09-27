import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClassGroup,
  Countdown,
  Course,
  ScheduleItem,
  SchoolEvent,
  SchoolGrade,
  Suggestion,
} from './escola.entity';
import { SchoolController } from './escola.controller';
import { SchoolService } from './escola.service';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    NotificacoesModule,
    TypeOrmModule.forFeature([
      SchoolEvent,
      ScheduleItem,
      Countdown,
      Suggestion,
      Course,
      SchoolGrade,
      ClassGroup,
    ]),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService, TypeOrmModule],
})
export class SchoolModule {}
