import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Repositories } from './entities/repositories.entity'
import { f } from '../../common/nestConfig/logger'
import { Datas } from './entities/datas.entity'
import { formatRepositoryName } from '../../common/utils'
import { UpdateDataDto } from '../data/dto/update-data.dto'
import { Users } from './entities/users.entity'
import { CreateUserDto } from '../users/dto/create-user.dto'

@Injectable()
export class DBService {
  private readonly logger = new Logger(DBService.name)

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Repositories)
    private readonly repoRepository: Repository<Repositories>,

    @InjectRepository(Datas)
    private readonly datasRepository: Repository<Datas>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    this.logger.log('createUser')
    try {
      const newUser = this.usersRepository.create({
        ...createUserDto,
      })
      await this.usersRepository.save(newUser)
      return newUser
    } catch (error) {
      this.logger.error(`createUser:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async getUserByEmailAndProvider(email: string, provider: string) {
    this.logger.log('getUserByEmailAndProvider')
    try {
      return await this.usersRepository.findOne({
        where: {
          email,
          provider,
        },
      })
    } catch (error) {
      this.logger.error(`getUserByEmailAndProvider:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async updateUser(user: Users, updateUserDto: CreateUserDto) {
    this.logger.log('updateUser')
    try {
      return await this.usersRepository.update(user.id, updateUserDto)
    } catch (error) {
      this.logger.error(`updateUser:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async getRepositories() {
    this.logger.log('getRepositories')
    try {
      const response = await this.repoRepository.find({
        where: {
          user: IsNull(),
        },
        order: {
          createdAt: 'ASC',
        },
      })
      this.logger.log(`response:_ ${response.length}`)

      return response
    } catch (error) {
      this.logger.error(`getRepositories:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async getRepositoriesByUserId(id: string) {
    this.logger.log('getRepositoriesById')
    try {
      return await this.repoRepository.find({
        where: {
          user: { id },
        },
        order: {
          createdAt: 'ASC',
        },
      })
    } catch (error) {
      this.logger.error(`getRepositoriesById:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async findRepository(url: string, userId: string | null) {
    this.logger.log('findRepository')
    console.log('userId', userId)
    try {
      return await this.repoRepository.findOne({
        where: { url, user: userId ? { id: userId } : IsNull() },
      })
    } catch (error) {
      this.logger.error(`findRepository:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async createRepository(name: string, url: string, userId: string | null) {
    this.logger.log('createRepository')
    try {
      const newRepository = this.repoRepository.create({
        name: formatRepositoryName(name),
        url,
        user: userId ? { id: userId } : null,
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

  async getDataById(dataId: string) {
    this.logger.log('getDataById')
    try {
      return await this.datasRepository.findOne({
        where: { id: dataId },
      })
    } catch (error) {
      this.logger.error(`getDataById:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async getDatasByRepositoryId(repositoryId: string) {
    this.logger.log('getDatas')
    try {
      return await this.datasRepository.findOne({
        relations: ['repository'],
        where: { repository: { id: repositoryId } },
      })
    } catch (error) {
      this.logger.error(`getDatas:_ ${f(error)}`)
      throw new Error(error)
    }
  }

  async updateDatas(dataId: string, updateDataDto: UpdateDataDto) {
    this.logger.log('updateDatas')
    try {
      return await this.datasRepository.update(dataId, updateDataDto)
    } catch (error) {
      this.logger.error(`updateDatas:_ ${f(error)}`)
      throw new Error(error)
    }
  }
}
