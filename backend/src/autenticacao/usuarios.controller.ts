import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { Roles } from '../comum/autenticacao';
import { Role } from '../comum/perfil';
import { AuthService } from './autenticacao.service';
import { CriarUsuarioDto, EditarUsuarioDto } from './usuarios.dto';

@Roles(Role.ADMIN)
@Controller('users')
export class UsuariosController {
  constructor(private readonly auth: AuthService) {}

  @Get() listar() { return this.auth.listarUsuarios(); }
  @Get(':id') consultar(@Param('id', ParseUUIDPipe) id: string) { return this.auth.getMe(id); }
  @Post() criar(@Body() dto: CriarUsuarioDto) { return this.auth.salvarUsuario(dto); }
  @Patch(':id') editar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: EditarUsuarioDto, @Req() req: { user: { id: string } }) {
    return this.auth.salvarUsuario(dto, id, req.user.id);
  }
  @Delete(':id') excluir(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: { id: string } }) {
    return this.auth.excluirUsuario(id, req.user.id);
  }
}
