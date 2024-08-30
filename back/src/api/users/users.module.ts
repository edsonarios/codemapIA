import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Users } from '../db/entities/users.entity'
import { Repositories } from '../db/entities/repositories.entity'
import { Datas } from '../db/entities/datas.entity'
import { DBService } from '../db/db.service'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Users, Repositories, Datas]),
  ],
  controllers: [UsersController],
  providers: [UsersService, DBService],
})
export class UsersModule {}
