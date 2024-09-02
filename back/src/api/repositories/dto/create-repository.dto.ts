import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateRepositoryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  url: string

  @IsString()
  @IsOptional()
  userId: string | null
}
