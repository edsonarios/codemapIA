import {
  Controller,
  Get,
  Post,
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
import { PatchDataDto } from './dto/patch-data.dto'

@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name)
  constructor(private readonly nodesAndEdgesService: DataService) {}

  @Get()
  findQuery(@Query('repository') repositoryId: string) {
    this.logger.log(`findQuery: ${repositoryId}`)
    return this.nodesAndEdgesService.findByRepositoryId(repositoryId)
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.nodesAndEdgesService.findOne(+id)
  // }

  // @Post()
  // create(@Body() createNodesAndEdgeDto: CreateNodesAndEdgeDto) {
  //   return this.nodesAndEdgesService.create(createNodesAndEdgeDto)
  // }

  @Post(':dataId')
  update(
    @Param('dataId') dataId: string,
    @Body() updateDataDto: UpdateDataDto,
  ) {
    this.logger.log(`update: ${dataId}`)
    return this.nodesAndEdgesService.update(dataId, updateDataDto)
  }

  @Patch(':dataId')
  patch(@Param('dataId') dataId: string, @Body() patchDataDto: PatchDataDto) {
    this.logger.log(`patch: ${dataId}`)
    return this.nodesAndEdgesService.patch(dataId, patchDataDto)
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.nodesAndEdgesService.remove(+id)
  // }
}
