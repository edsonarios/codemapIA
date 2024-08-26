import { Logger, Module } from '@nestjs/common'
import { CodemapModule } from './api/codemap/codemap.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { f } from './common/nestConfig/logger'

const { STAGE } = process.env
const logger = new Logger('AppModule')
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
          logger.verbose(`Connecting Base DB by:_ ${f(credentialsBase)}`)
        }

        return {
          type: 'postgres',
          host: credentialsBase.host,
          port: credentialsBase.port,
          username: credentialsBase.username,
          password: credentialsBase.password,
          database: credentialsBase.database,
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
          ssl: { rejectUnauthorized: false },
        }
      },
    }),
    CodemapModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
