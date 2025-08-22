import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsEmail,
  IsDate,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Length,
  Min,
  Max,
  IsPositive,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
} from 'class-validator'

export class TestEntity {
  // Basic primitives
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(0)
  @Max(100)
  age: number

  @IsNumber()
  @IsPositive()
  score: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  // String validations
  @IsEmail()
  email: string

  @IsString()
  @Length(8, 20)
  password: string

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  description: string

  // Dates
  @IsDate()
  createdAt: Date

  // Arrays
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  tags: string[]

  @IsArray()
  @IsInt({ each: true })
  numbers: number[]

  // Special types
  avatar: Buffer

  files: Uint8Array[]
}
