import { IsEmail, IsEnum, IsString, IsUUID, Matches, MinLength, ValidateIf } from 'class-validator';
import { Role } from '../comum/perfil';

export class CriarUsuarioDto {
  @IsString() @Matches(/\S/, { message: 'Informe o nome.' }) name: string;
  @IsEmail() email: string;
  @IsEnum(Role) role: Role;
  @IsString() @MinLength(5) password: string;
  @ValidateIf((_object, value) => value !== undefined && value !== null) @IsUUID() classGroupId?: string | null;
}

export class EditarUsuarioDto {
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Matches(/\S/) name?: string;
  @ValidateIf((_object, value) => value !== undefined) @IsEmail() email?: string;
  @ValidateIf((_object, value) => value !== undefined) @IsEnum(Role) role?: Role;
  @ValidateIf((_object, value) => value !== undefined) @IsString() @MinLength(5) password?: string;
  @ValidateIf((_object, value) => value !== undefined && value !== null) @IsUUID() classGroupId?: string | null;
}
