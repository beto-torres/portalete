import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './usuario.entity';
import { SolicitacaoRedefinicaoSenha } from './recuperacao-senha.entity';
import { ClassGroup, Course, SchoolGrade } from '../escola/escola.entity';
import { AuthController } from './autenticacao.controller';
import { AuthService } from './autenticacao.service';
import { AuthGuard, RolesGuard } from '../comum/autenticacao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SolicitacaoRedefinicaoSenha,
      Course,
      SchoolGrade,
      ClassGroup,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'dev-secret'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
