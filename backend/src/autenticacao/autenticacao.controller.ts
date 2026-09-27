import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { AuthService } from './autenticacao.service';
import {
  AtualizarPerfilDto,
  LoginDto,
  RedefinirSenhaComCodigoDto,
  RegisterDto,
  SolicitarRedefinicaoDto,
} from './autenticacao.dto';
import { Public, Roles } from '../comum/autenticacao';
import { Role } from '../comum/perfil';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Get('me')
  me(@Req() request: { user: { id: string } }) {
    return this.auth.getMe(request.user.id);
  }

  @Patch('perfil')
  atualizarPerfil(
    @Req() request: { user: { id: string } },
    @Body() dto: AtualizarPerfilDto,
  ) {
    return this.auth.atualizarPerfil(request.user.id, dto);
  }

  @Public()
  @Post('recuperacao/solicitacoes')
  solicitar(@Body() dto: SolicitarRedefinicaoDto) {
    return this.auth.solicitarRedefinicao(dto);
  }

  @Public()
  @Post('recuperacao/redefinir')
  redefinir(@Body() dto: RedefinirSenhaComCodigoDto) {
    return this.auth.redefinirSenhaComCodigo(dto);
  }

  @Roles(Role.ADMIN)
  @Get('recuperacao/solicitacoes')
  listarSolicitacoes() {
    return this.auth.listarSolicitacoes();
  }

  @Roles(Role.ADMIN)
  @Patch('recuperacao/solicitacoes/:id/aprovar')
  aprovar(@Param('id') id: string) {
    return this.auth.aprovarSolicitacao(id);
  }
}
