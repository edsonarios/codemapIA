import { Module } from '@nestjs/common'
import { RepositoriesService } from './repositories.service'
import { RepositoriesController } from './repositories.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Repositories } from '../db/entities/repositories.entity'
import { Datas } from '../db/entities/datas.entity'
import { DBService } from '../db/db.service'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Repositories, Datas])],
  controllers: [RepositoriesController],
  providers: [RepositoriesService, DBService],
})
export class RepositoriesModule {}
