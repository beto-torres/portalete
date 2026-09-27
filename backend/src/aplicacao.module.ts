import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './autenticacao/autenticacao.module';
import { SchoolModule } from './escola/escola.module';
import { TraduzirEstruturaBancoDados1727200000000 } from './migracoes/1727200000000-TraduzirEstruturaBancoDados';
import { CriarRecuperacaoSenha1727200000001 } from './migracoes/1727200000001-CriarRecuperacaoSenha';
import { AjustarRecuperacaoPorCodigo1727200000002 } from './migracoes/1727200000002-AjustarRecuperacaoPorCodigo';
import { VincularAlunoCursoSerieTurma1727200000003 } from './migracoes/1727200000003-VincularAlunoCursoSerieTurma';
import { CriarNotificacoesPorGrupo1727200000004 } from './migracoes/1727200000004-CriarNotificacoesPorGrupo';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        ],
        migrationsRun: true,
        migrationsTableName: 'migracoes',
        synchronize: true,
      }),
    }),
    AuthModule,
    SchoolModule,
  ],
})
export class AppModule {}
