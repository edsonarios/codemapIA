import { Module } from '@nestjs/common'
import { CodemapService } from './codemap.service'
import { CodemapController } from './codemap.controller'
import { DBService } from './db/db.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { Repositories } from './db/entities/repositories.entity'
import { Datas } from './db/entities/datas.entity'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Repositories, Datas])],
  controllers: [CodemapController],
  providers: [CodemapService, DBService],
})
export class CodemapModule {}
