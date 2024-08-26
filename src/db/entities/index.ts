import { DataSource } from 'typeorm'
import { Repositories } from './repositories.entity'
import { Datas } from './data.entity'
export const DBSource = new DataSource({
  type: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  entities: [Repositories, Datas],
  synchronize: true,
})
