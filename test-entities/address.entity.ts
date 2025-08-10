import { IsString, IsNotEmpty, MinLength } from 'class-validator'

export class Address {
  @IsString()
  @IsNotEmpty()
  street: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsString()
  @MinLength(2)
  country: string
}
