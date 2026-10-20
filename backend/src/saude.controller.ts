import { Controller, Get } from '@nestjs/common';
import { Public } from './comum/autenticacao';

@Controller('health')
export class SaudeController {
  @Public()
  @Get()
  verificar() {
    return { status: 'ok' };
  }
}
