import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from './perfil';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../autenticacao/usuario.entity';

export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector, @InjectRepository(User) private users: Repository<User>) {}
  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Faça login para continuar.');
    try {
      const payload = this.jwt.verify<{ id: string }>(token);
      if (!payload || typeof payload.id !== 'string' || !payload.id) throw new UnauthorizedException();
      const user = await this.users.findOneBy({ id: payload.id });
      if (!user) throw new UnauthorizedException();
      request.user = { id: user.id, name: user.name, email: user.email, role: user.role, courseId: user.courseId, gradeId: user.gradeId, classGroupId: user.classGroupId };
      return true;
    }
    catch { throw new UnauthorizedException('Sessão inválida ou expirada.'); }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;
    return roles.includes(context.switchToHttp().getRequest().user.role);
  }
}
