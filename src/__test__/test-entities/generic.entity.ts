import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator'

// Generic base class similar to BaseDto
export class BaseDto<T> {
  public data: T
}

// Simple class to use as generic parameter
export class UserData {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(1)
  id: number
}

// Class that uses the generic
export class GenericEntity {
  @IsNotEmpty()
  user: BaseDto<UserData>

  @IsString()
  description: string
}
