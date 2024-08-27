import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateRepositoryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  url: string
}
