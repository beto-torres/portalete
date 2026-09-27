import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class EventDto {
  @IsString() title: string;
  @IsDateString() date: string;
  @IsString() time: string;
  @IsString() location: string;
  @IsString() audience: string;
  @IsString() category: string;
  @IsString() description: string;
  @IsString() color: string;
  @IsOptional() @IsUrl() link?: string;
}
export class ScheduleDto {
  @IsString() className: string;
  @IsString() teacher: string;
  @IsInt() @Min(1) @Max(5) day: number;
  @IsInt() @Min(1) @Max(9) lesson: number;
  @IsString() subject: string;
}
export class CountdownDto {
  @IsString() title: string;
  @IsDateString() date: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class SuggestionDto {
  @IsString() title: string;
  @IsString() className: string;
  @IsString() category: string;
  @IsString() description: string;
}
export enum StatusSuggestion { PENDING = 'pendente', APPROVED = 'aprovada', REJECTED = 'reprovada' }
export class UpdateSuggestionStatusDto { @IsEnum(StatusSuggestion) status: StatusSuggestion; }
