import { PartialType } from '@nestjs/mapped-types'
import { CreateDataDto } from './create-data.dto'
import { IsOptional } from 'class-validator'

export class UpdateDataDto extends PartialType(CreateDataDto) {
  @IsOptional()
  contentFiles: object | null

  @IsOptional()
  fileDetails: object | null

  @IsOptional()
  nodesAndEdges: object | null

  @IsOptional()
  structure: object | null
}
