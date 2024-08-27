import { Injectable, Logger } from '@nestjs/common'
// import { CreateNodesAndEdgeDto } from './dto/create-nodes-and-edge.dto'
import { UpdateDataDto } from './dto/update-data.dto'
import { DBService } from '../db/db.service'
import { f } from 'src/common/nestConfig/logger'

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name)
  constructor(private readonly dbService: DBService) {}

  async findByQuery(repository: string) {
    try {
      const response = await this.dbService.getDatas(repository)
      // this.logger.log(f(response))
      return response
    } catch (error) {
      this.logger.error(`getRepositories:_ ${f(error)}`)
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} nodesAndEdge`
  // }
  // create(createNodesAndEdgeDto: CreateNodesAndEdgeDto) {
  //   return 'This action adds a new nodesAndEdge'
  // }

  // findAll() {
  //   return `This action returns all nodesAndEdges`
  // }

  async update(dataId: string, updateDataDto: UpdateDataDto) {
    this.logger.log('update')
    try {
      await this.dbService.updateDatas(dataId, updateDataDto)
      return { response: 'Saved successfully' }
    } catch (error) {
      this.logger.error(`update:_ ${f(error)}`)
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} nodesAndEdge`
  // }
}
