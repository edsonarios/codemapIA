import { Module } from '@nestjs/common'
import { DataService } from './data.service'
import { DataController } from './data.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Repositories } from '../db/entities/repositories.entity'
import { Datas } from '../db/entities/datas.entity'
import { DBService } from '../db/db.service'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Repositories, Datas])],
  controllers: [DataController],
  providers: [DataService, DBService],
})
export class DataModule {}
