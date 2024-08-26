import { Repository } from 'typeorm'
import { DBSource } from '../entities'
import { Repositories } from '../entities/repositories.entity'
import { Datas } from '../entities/data.entity'

export class DBRepository {
  private readonly RepoRepository: Repository<Repositories>
  private readonly DatasRepository: Repository<Datas>
  constructor() {
    this.RepoRepository = DBSource.getRepository(Repositories)
    this.DatasRepository = DBSource.getRepository(Datas)
  }

  async initializeClient() {
    try {
      if (!DBSource.isInitialized) {
        await DBSource.initialize()
      }
    } catch (error) {
      console.error('Error initializing client:', error)
      throw error
    }
  }

  async getRepositories() {
    return await this.RepoRepository.find()
  }
}
