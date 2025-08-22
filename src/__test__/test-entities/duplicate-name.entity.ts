import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

// Class with the same name that exists in another file but with different properties
export class UserData {
  @IsString()
  @IsNotEmpty()
  email!: string

  @IsNumber()
  score!: number

  @IsString()
  status!: string
}
