import { Injectable } from '@nestjs/common'
import { CreateRepositoryDto } from './dto/create-repository.dto'
import { UpdateRepositoryDto } from './dto/update-repository.dto'
import { DBService } from '../db/db.service'

@Injectable()
export class RepositoriesService {
  constructor(private readonly dbService: DBService) {}
  create(createRepositoryDto: CreateRepositoryDto) {
    return 'This action adds a new repository'
  }

  async findAll() {
    try {
      return await this.dbService.getRepositories()
    } catch (error) {
      throw new Error(error)
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} repository`
  }

  update(id: number, updateRepositoryDto: UpdateRepositoryDto) {
    return `This action updates a #${id} repository`
  }

  remove(id: number) {
    return `This action removes a #${id} repository`
  }
}
