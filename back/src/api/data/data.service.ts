import { Injectable, Logger } from '@nestjs/common'
// import { CreateNodesAndEdgeDto } from './dto/create-nodes-and-edge.dto'
// import { UpdateNodesAndEdgeDto } from './dto/update-nodes-and-edge.dto'
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

  // update(id: number, updateNodesAndEdgeDto: UpdateNodesAndEdgeDto) {
  //   return `This action updates a #${id} nodesAndEdge`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} nodesAndEdge`
  // }
}
