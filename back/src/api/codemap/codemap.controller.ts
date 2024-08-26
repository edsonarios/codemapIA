import { Controller, Get, HttpCode, Logger } from '@nestjs/common'
import { CodemapService } from './codemap.service'

@Controller({
  path: 'codemap',
  version: '1',
})
export class CodemapController {
  private readonly logger = new Logger(CodemapController.name)
  constructor(private readonly codemapService: CodemapService) {}
  @Get()
  @HttpCode(200)
  create() {
    this.logger.log(`create:_`)
    return this.codemapService.get()
  }
}
