import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Repositories } from './entities/repositories.entity'
import { f } from 'src/common/nestConfig/logger'

@Injectable()
export class DBService {
  private readonly logger = new Logger(DBService.name)

  constructor(
    @InjectRepository(Repositories)
    private readonly repoRepository: Repository<Repositories>,
  ) {}

  async getRepositories() {
    this.logger.log('getRepositories')
    try {
      const response = await this.repoRepository.find()
      this.logger.log(`response:_ ${response.length}`)

      return response
    } catch (error) {
      this.logger.error(`getRepositories:_ ${f(error)}`)
      throw new Error(error)
    }
  }
}
