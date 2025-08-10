import {
  IsString,
  Length,
  MinLength,
  ArrayNotEmpty,
  ArrayMaxSize,
  ArrayMinSize,
  MaxLength,
  Min,
  Max,
  IsInt,
  IsPositive,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator'
import { Role } from './role.entity.js'

export class UserEntity {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Min(1)
  id: number

  @IsString()
  @Length(2, 65)
  name: string

  @IsString()
  @MinLength(2)
  @MaxLength(65)
  lastName: string

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(130)
  age: number

  @IsEmail()
  email: string

  @IsString()
  @Length(8, 60)
  password: string

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  pictures: Uint8Array[]

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date

  @IsNotEmpty()
  role: Role
}
