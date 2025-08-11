import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDate,
  IsEmail,
  IsPositive,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Length,
  Min,
  Max,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator'
import { Address } from './address.entity.js'

export class CompleteEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string

  @IsEmail()
  email: string

  @IsBoolean()
  active: boolean

  @IsDate()
  createdAt: Date

  @IsNumber()
  @IsPositive()
  price: number

  @IsString()
  @Length(3, 10)
  code: string

  @IsString()
  @Length(5)
  shortCode: string

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  tags: string[]

  @IsArray()
  emails: string[]

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  numbers: number[]

  @IsNotEmpty()
  address: Address

  profile: Partial<CompleteEntity>
}
