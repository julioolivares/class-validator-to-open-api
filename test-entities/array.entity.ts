import {
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
} from 'class-validator'

export class ArrayEntity {
  @IsArray()
  @IsString({ each: true })
  basicArray: string[]

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  requiredArray: string[]

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  minSizeArray: string[]

  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  maxSizeArray: string[]

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  boundedArray: string[]
}
