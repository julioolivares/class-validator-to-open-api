import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator'

export class OptionalPropertiesUser {
  // Required property without decorator (no ?)
  name: string

  // Optional property without decorator (has ?)
  nickname?: string

  // Required property with decorator (no ?)
  @IsString()
  @IsNotEmpty()
  email: string

  // Optional property with @IsOptional decorator (has ?)
  @IsOptional()
  @IsString()
  middleName?: string

  // Required property with decorator but no IsNotEmpty (no ?)
  @IsInt()
  @Min(18)
  @Max(100)
  age: number

  // Optional property with decorator but no IsOptional (has ?)
  @IsInt()
  @Min(0)
  score?: number

  // Property with IsNotEmpty but marked as optional (has ?)
  // This should still be required because IsNotEmpty overrides the optional status
  @IsString()
  @IsNotEmpty()
  requiredButOptionalSyntax?: string

  // Plain optional property without any decorators (has ?)
  bio?: string

  // Plain required property without any decorators (no ?)
  username: string
}
