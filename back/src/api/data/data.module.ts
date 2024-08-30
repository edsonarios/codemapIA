import { Module } from '@nestjs/common'
import { DataService } from './data.service'
import { DataController } from './data.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Repositories } from '../db/entities/repositories.entity'
import { Datas } from '../db/entities/datas.entity'
import { DBService } from '../db/db.service'
import { Users } from '../db/entities/users.entity'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Users, Repositories, Datas]),
  ],
  controllers: [DataController],
  providers: [DataService, DBService],
})
export class DataModule {}
