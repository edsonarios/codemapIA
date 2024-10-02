import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common'
import { RepositoriesService } from './repositories.service'
import { CreateRepositoryDto } from './dto/create-repository.dto'
import { f } from '../../common/nestConfig/logger'
import { Repositories } from '../db/entities/repositories.entity'

@Controller('repositories')
export class RepositoriesController {
  private readonly logger = new Logger(RepositoriesController.name)
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post()
  create(@Body() createRepositoryDto: CreateRepositoryDto) {
    this.logger.log(`POST create:_ ${f(createRepositoryDto)}`)
    return this.repositoriesService.create(createRepositoryDto)
  }

  @Get()
  findAll() {
    this.logger.log(`GET findAll`)
    return this.repositoriesService.findAll()
  }

  @Get('getOne/:id')
  findOne(@Param('id') id: string) {
    this.logger.log(`GET findOne Repo: ${id}`)
    return this.repositoriesService.findOne(id)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    this.logger.log(`GET findById:_ ${f(id)}`)
    return this.repositoriesService.findByUserId(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepositoryDto: Repositories) {
    return this.repositoriesService.update(id, updateRepositoryDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repositoriesService.remove(id)
  }
}
