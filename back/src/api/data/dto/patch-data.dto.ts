import { PartialType } from '@nestjs/mapped-types'
import { CreateDataDto } from './create-data.dto'
import { IsString } from 'class-validator'

export class PatchDataDto extends PartialType(CreateDataDto) {
  @IsString()
  key: string

  @IsString()
  detail: string
}
