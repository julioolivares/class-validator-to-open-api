import { IsString, IsNotEmpty, IsArray } from 'class-validator'

export class BrokenEntity {
  @IsString()
  @IsNotEmpty()
  name: string

  // This should cause issues - circular reference
  parent?: BrokenEntity

  // Array without proper type decoration
  @IsArray()
  items?: any[]

  // Property without any decorators
  undecoratedProperty?: string

  // Complex type that doesn't exist
  complexType?: Map<string, Set<number>>
}
