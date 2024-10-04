import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RepositoriesModule } from './api/repositories/repositories.module'
import { DbModule } from './api/db/db.module'
import { DataModule } from './api/data/data.module'
import { VercelLogger } from './common/nestConfig/logger'
import { UsersModule } from './api/users/users.module'
import { LoginModule } from './api/login/login.module'

const { STAGE } = process.env
const logger = new VercelLogger('AppModule')
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const credentialsBase = {
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT || 5432,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        }
        if (STAGE !== 'prod') {
          logger.verbose('Connecting Base DB by', credentialsBase)
          // logger.log('Connecting Base DB by', credentialsBase)
        }

        return {
          type: 'postgres',
          host: credentialsBase.host,
          port: credentialsBase.port,
          username: credentialsBase.username,
          password: credentialsBase.password,
          database: credentialsBase.database,
          autoLoadEntities: true,
          synchronize: false,
          logging: false,
          ssl: { rejectUnauthorized: false },
        }
      },
    }),
    DbModule,
    RepositoriesModule,
    DataModule,
    UsersModule,
    LoginModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
