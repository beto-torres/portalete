import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../comum/perfil';

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(5) password: string;
}

export class RegisterDto extends LoginDto {
  @IsString() name: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsString() authorizationCode?: string;
  @IsOptional() @IsString() courseId?: string;
  @IsOptional() @IsString() gradeId?: string;
  @IsOptional() @IsString() classGroupId?: string;
  @IsOptional() @IsString() curso?: string;
  @IsOptional() @IsString() serie?: string;
  @IsOptional() @IsString() turma?: string;
}

export class AtualizarPerfilDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() courseId?: string;
  @IsOptional() @IsString() gradeId?: string;
  @IsOptional() @IsString() classGroupId?: string;
  @IsOptional() @IsString() curso?: string;
  @IsOptional() @IsString() serie?: string;
  @IsOptional() @IsString() turma?: string;
}

export class RedefinirSenhaComCodigoDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) code: string;
  @IsString() @MinLength(5) newPassword: string;
}

export class SolicitarRedefinicaoDto {
  @IsEmail() email: string;
  @IsOptional() @IsString() reason?: string;
}
