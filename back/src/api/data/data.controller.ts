import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  // Delete,
  // Param,
  Logger,
  Query,
} from '@nestjs/common'
import { DataService } from './data.service'
// import { CreateNodesAndEdgeDto } from './dto/create-nodes-and-edge.dto'
// import { UpdateNodesAndEdgeDto } from './dto/update-nodes-and-edge.dto'

@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name)
  constructor(private readonly nodesAndEdgesService: DataService) {}

  @Get()
  findQuery(@Query('repository') repository: string) {
    this.logger.log(`findQuery: ${repository}`)
    return this.nodesAndEdgesService.findByQuery(repository)
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.nodesAndEdgesService.findOne(+id)
  // }

  // @Post()
  // create(@Body() createNodesAndEdgeDto: CreateNodesAndEdgeDto) {
  //   return this.nodesAndEdgesService.create(createNodesAndEdgeDto)
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateNodesAndEdgeDto: UpdateNodesAndEdgeDto,
  // ) {
  //   return this.nodesAndEdgesService.update(+id, updateNodesAndEdgeDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.nodesAndEdgesService.remove(+id)
  // }
}
