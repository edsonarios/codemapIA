import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { RepositoriesService } from './repositories.service'
import { CreateRepositoryDto } from './dto/create-repository.dto'
import { VercelLogger } from '../../common/nestConfig/logger'
import { Repositories } from '../db/entities/repositories.entity'

@Controller('repositories')
export class RepositoriesController {
  private readonly logger = new VercelLogger(RepositoriesController.name)
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post()
  create(@Body() createRepositoryDto: CreateRepositoryDto) {
    this.logger.log('create', createRepositoryDto)
    return this.repositoriesService.create(createRepositoryDto)
  }

  @Get()
  findAll() {
    this.logger.log(`findAll`)
    return this.repositoriesService.findAll()
  }

  @Get('getOne/:id')
  findOne(@Param('id') id: string) {
    this.logger.log('findOne', id)
    return this.repositoriesService.findOne(id)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    this.logger.log('findById', id)
    return this.repositoriesService.findByUserId(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepositoryDto: Repositories) {
    this.logger.log('update', id, updateRepositoryDto)
    return this.repositoriesService.update(id, updateRepositoryDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log('remove', id)
    return this.repositoriesService.remove(id)
  }
}
