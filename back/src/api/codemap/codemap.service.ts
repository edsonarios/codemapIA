import { Injectable } from '@nestjs/common'
import { DBService } from './db/db.service'

@Injectable()
export class CodemapService {
  constructor(private readonly dbService: DBService) {}
  async get() {
    try {
      const response = await this.dbService.getRepositories()
      return {
        size: response.length,
        data: response,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
