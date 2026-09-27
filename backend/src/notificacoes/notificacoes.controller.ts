import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';

type UsuarioAutenticado = { id: string };
type RequisicaoAutenticada = { user: UsuarioAutenticado };

@Controller('notifications')
export class NotificacoesController {
  constructor(private readonly notifications: NotificacoesService) {}

  @Get()
  list(@Req() request: RequisicaoAutenticada) {
    return this.notifications.listForUser(request.user.id);
  }

  @Get('unread-count')
  async unreadCount(@Req() request: RequisicaoAutenticada) {
    return { count: await this.notifications.unreadCount(request.user.id) };
  }

  @Patch('read-all')
  readAll(@Req() request: RequisicaoAutenticada) {
    return this.notifications.markAllAsRead(request.user.id);
  }

  @Patch(':id/read')
  read(
    @Param('id') id: string,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.notifications.markAsRead(id, request.user.id);
  }
}
