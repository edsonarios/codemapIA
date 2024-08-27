import {
  Controller,
  Get,
  // Post,
  Body,
  Patch,
  // Delete,
  // Param,
  Logger,
  Query,
  Param,
} from '@nestjs/common'
import { DataService } from './data.service'
// import { CreateNodesAndEdgeDto } from './dto/create-nodes-and-edge.dto'
import { UpdateDataDto } from './dto/update-data.dto'

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

  @Patch(':dataId')
  update(
    @Param('dataId') dataId: string,
    @Body() updateDataDto: UpdateDataDto,
  ) {
    this.logger.log(`update: ${dataId}`)
    return this.nodesAndEdgesService.update(dataId, updateDataDto)
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.nodesAndEdgesService.remove(+id)
  // }
}
