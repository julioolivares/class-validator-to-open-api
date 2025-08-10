import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsPositive,
  IsNotEmpty,
} from 'class-validator'
export class Role {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id: number

  @IsString()
  @MinLength(1)
  @MaxLength(65)
  name: string
}
