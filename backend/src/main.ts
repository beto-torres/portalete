import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './aplicacao.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => new BadRequestException({
      statusCode: 400,
      error: 'Dados inválidos',
      message: errors.flatMap((error) => traduzirErrosDeValidacao(error)),
    }),
  }));
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}

function traduzirErrosDeValidacao(error: ValidationError): string[] {
  const nomes: Record<string, string> = {
    name: 'nome', password: 'senha', role: 'perfil', authorizationCode: 'código de autorização',
    title: 'título', date: 'data', time: 'horário', location: 'local', audience: 'público-alvo',
    category: 'categoria', description: 'descrição', color: 'cor', className: 'turma', teacher: 'professor',
    day: 'dia', lesson: 'aula', subject: 'disciplina', active: 'ativo',
  };
  const campo = nomes[error.property] ?? error.property;
  const mensagens: Record<string, string> = {
    isEmail: `${campo} deve ser um endereço de e-mail válido`,
    isString: `${campo} deve ser um texto`,
    minLength: `${campo} não possui o tamanho mínimo exigido`,
    isEnum: `${campo} possui um valor inválido`,
    isDateString: `${campo} deve ser uma data válida`,
    isUrl: `${campo} deve ser um endereço de internet válido`,
    isBoolean: `${campo} deve ser verdadeiro ou falso`,
    isInt: `${campo} deve ser um número inteiro`,
    min: `${campo} está abaixo do valor mínimo permitido`,
    max: `${campo} está acima do valor máximo permitido`,
  };
  const atuais = Object.keys(error.constraints ?? {}).map((tipo) => mensagens[tipo] ?? `${campo} é inválido`);
  return [...atuais, ...(error.children ?? []).flatMap((child) => traduzirErrosDeValidacao(child))];
}
bootstrap();
