import * as path from 'path'
import * as fs from 'fs'
import extract from 'extract-zip' // work in prod
// import * as extract from 'extract-zip'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { CreateRepositoryDto } from './dto/create-repository.dto'
import { DBService } from '../db/db.service'
import { routePath } from '../../common/utils'
import axios from 'axios'
import { processRepository } from './processRepository'
import { f } from '../../common/nestConfig/logger'

@Injectable()
export class RepositoriesService {
  private readonly logger = new Logger(RepositoriesService.name)
  constructor(private readonly dbService: DBService) {}

  async findAll() {
    this.logger.log('findAll')
    try {
      const response = await this.dbService.getRepositories()
      const auxResponse = {
        response: response.map((repo) => {
          return {
            id: repo.id,
            name: repo.name,
            url: repo.url,
          }
        }),
      }
      this.logger.debug(`response:_ ${f(auxResponse)}`)
      return response
    } catch (error) {
      throw error
    }
  }

  async findByUserId(id: string) {
    this.logger.log('findById')
    try {
      return await this.dbService.getRepositoriesByUserId(id)
    } catch (error) {
      throw error
    }
  }

  async create(createRepositoryDto: CreateRepositoryDto) {
    this.logger.log('create')
    const { url, userId } = createRepositoryDto
    console.log('userId', userId)
    const repoName = url.replace('https://github.com/', '')
    const nameUser = repoName.split('/')[0]
    const repositoryName = repoName.split('/')[1]
    const cloneDir = path.resolve(routePath, 'clonedRepositories', nameUser)
    const zipPath = path.resolve(
      routePath,
      'clonedRepositories',
      `${repoName}.zip`,
    )

    try {
      if (!fs.existsSync(cloneDir)) {
        fs.mkdirSync(cloneDir, { recursive: true })
      }
    } catch (error: any) {
      return {
        error: 'Error cloning repository',
        message: error.message,
      }
    }

    try {
      const repository = await this.dbService.findRepository(url, userId)
      if (repository) {
        return { id: repository.id }
      } else {
        //? Check if the user has reached the limit of repositories
        if (userId) {
          const user = await this.dbService.getUserById(userId)
          const repositories =
            await this.dbService.getRepositoriesByUserId(userId)
          if (repositories.length >= user.allowedRepos) {
            throw new UnauthorizedException(
              'You have reached the limit of repositories',
            )
          }
        }

        const downloadUrl = `${url}/archive/refs/heads/main.zip`
        const response = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
        })
        fs.writeFileSync(zipPath, response.data)
        await extract(zipPath, { dir: cloneDir })
        fs.unlinkSync(zipPath)

        const { structure, contentFiles, nodesAndEdges } =
          await processRepository(`${repoName}-main`)

        const newRepository = await this.dbService.createRepository(
          repositoryName,
          url,
          userId,
        )
        await this.dbService.createDataByRepository(
          newRepository,
          structure,
          contentFiles,
          nodesAndEdges,
        )

        // fs.rmdirSync(path.resolve(cloneDir, `${repositoryName}-main`), {
        fs.rmSync(path.resolve(cloneDir, `${repositoryName}-main`), {
          recursive: true,
        })
        return { id: newRepository.id }
      }
    } catch (error: any) {
      throw error
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} repository`
  }

  // update(id: number, updateRepositoryDto: UpdateRepositoryDto) {
  //   return `This action updates a #${id} repository`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} repository`
  // }
}
