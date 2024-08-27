import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Repositories } from './entities/repositories.entity'
import { f } from 'src/common/nestConfig/logger'
import { Datas } from './entities/datas.entity'
import { formatRepositoryName } from 'src/common/utils'

@Injectable()
export class DBService {
  private readonly logger = new Logger(DBService.name)

  constructor(
    @InjectRepository(Repositories)
    private readonly repoRepository: Repository<Repositories>,

    @InjectRepository(Datas)
    private readonly datasRepository: Repository<Datas>,
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

  async findRepository(url: string) {
    this.logger.log('findRepository')
    try {
      return await this.repoRepository.findOne({
        where: { url },
      })
    } catch (error) {
      this.logger.error(`findRepository:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async createRepository(name: string, url: string) {
    this.logger.log('createRepository')
    try {
      const newRepository = this.repoRepository.create({
        name: formatRepositoryName(name),
        url,
      })
      await this.repoRepository.save(newRepository)
      return newRepository
    } catch (error) {
      this.logger.error(`createRepository:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async createDataByRepository(
    repository: Repositories,
    structure: object,
    contentFiles: object,
    nodesAndEdges: object,
  ) {
    this.logger.log('createDataByRepository')
    try {
      const newDatas = this.datasRepository.create({
        repository,
        structure,
        contentFiles,
        nodesAndEdges,
      })
      await this.datasRepository.save(newDatas)
      return newDatas
    } catch (error) {
      this.logger.error(`createDataByRepository:_ ${f(error)}`)
      throw new Error(error)
    }
  }
}
