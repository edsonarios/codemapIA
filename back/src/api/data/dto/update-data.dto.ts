import { PartialType } from '@nestjs/mapped-types'
import { CreateNodesAndEdgeDto } from './create-data.dto'

export class UpdateNodesAndEdgeDto extends PartialType(CreateNodesAndEdgeDto) {}
