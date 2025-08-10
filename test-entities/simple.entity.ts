import { IsString, IsNotEmpty, IsEmail, IsInt, Min, Max } from 'class-validator'

export class SimpleUser {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsInt()
  @Min(18)
  @Max(100)
  age: number
}
