import { Module } from '@nestjs/common';
import { SaudeController } from './saude.controller';
import { validarAmbiente } from './configuracao-ambiente';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './autenticacao/autenticacao.module';
import { SchoolModule } from './escola/escola.module';
import { TraduzirEstruturaBancoDados1727200000000 } from './migracoes/1727200000000-TraduzirEstruturaBancoDados';
import { CriarRecuperacaoSenha1727200000001 } from './migracoes/1727200000001-CriarRecuperacaoSenha';
import { AjustarRecuperacaoPorCodigo1727200000002 } from './migracoes/1727200000002-AjustarRecuperacaoPorCodigo';
import { VincularAlunoCursoSerieTurma1727200000003 } from './migracoes/1727200000003-VincularAlunoCursoSerieTurma';
import { CriarNotificacoesPorGrupo1727200000004 } from './migracoes/1727200000004-CriarNotificacoesPorGrupo';
import { PreencherHorario3NutA1727200000005 } from './migracoes/1727200000005-PreencherHorario3NutA';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validarAmbiente }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        migrations: [
          TraduzirEstruturaBancoDados1727200000000,
          CriarRecuperacaoSenha1727200000001,
          AjustarRecuperacaoPorCodigo1727200000002,
          VincularAlunoCursoSerieTurma1727200000003,
          CriarNotificacoesPorGrupo1727200000004,
          PreencherHorario3NutA1727200000005,
        ],
        migrationsRun: config.get<string>('MIGRATIONS_RUN') !== 'false',
        migrationsTableName: 'migracoes',
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        extra: { max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 },
      }),
    }),
    AuthModule,
    SchoolModule,
  ],
  controllers: [SaudeController],
})
export class AppModule {}
