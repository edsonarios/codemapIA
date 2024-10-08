import { Module } from '@nestjs/common'
import { DBService } from './db.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Repositories } from './entities/repositories.entity'
import { Datas } from './entities/datas.entity'
import { Users } from './entities/users.entity'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Users, Repositories, Datas]),
  ],
  providers: [DBService],
})
export class DbModule {}
