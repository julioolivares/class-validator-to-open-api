import { SchemaTransformer } from '../src/transformer.js'
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator'

// Example entity demonstrating automatic optional properties support
class User {
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

console.log(
  '=== Example: Automatic TypeScript Optional Properties Support ===\n'
)

// The library now automatically uses TypeScript optional syntax (?) to determine required fields
console.log('Automatic behavior based on TypeScript syntax:')
const transformer = SchemaTransformer.getInstance()
const result = transformer.transform(User)

console.log('Required fields:', result.schema.required)
console.log('\nLogic applied:')
console.log('- Properties without ? operator → required')
console.log('- Properties with ? operator → optional')
console.log('- IsNotEmpty decorator overrides ? operator → always required')
console.log('- Other decorators respect the ? operator\n')

// Show all properties in the schema
console.log('All properties in schema:')
Object.keys(result.schema.properties).forEach(prop => {
  const isRequired = result.schema.required.includes(prop)
  const property = result.schema.properties[prop]
  console.log(
    `  ${prop}: ${property.type} ${isRequired ? '(required)' : '(optional)'}`
  )
})

// Example with plain TypeScript classes (no decorators)
console.log('\n=== Plain TypeScript Class Example ===')

class PlainUser {
  id: number
  name: string
  email?: string
  isActive: boolean
  lastLogin?: Date
}

const plainResult = transformer.transform(PlainUser)
console.log('Plain class required fields:', plainResult.schema.required)
console.log('Plain class properties:')
Object.keys(plainResult.schema.properties).forEach(prop => {
  const isRequired = plainResult.schema.required.includes(prop)
  const property = plainResult.schema.properties[prop]
  console.log(
    `  ${prop}: ${property.type} ${isRequired ? '(required)' : '(optional)'}`
  )
})

// Example demonstrating IsNotEmpty override
console.log('\n=== IsNotEmpty Override Example ===')

class OverrideExample {
  @IsNotEmpty()
  requiredEvenWithQuestionMark?: string // Required because of IsNotEmpty

  normalOptional?: string // Optional because of ?

  normalRequired: string // Required because no ?
}

const overrideResult = transformer.transform(OverrideExample)
console.log('Override example required fields:', overrideResult.schema.required)
console.log('Override example properties:')
Object.keys(overrideResult.schema.properties).forEach(prop => {
  const isRequired = overrideResult.schema.required.includes(prop)
  const property = overrideResult.schema.properties[prop]
  console.log(
    `  ${prop}: ${property.type} ${isRequired ? '(required)' : '(optional)'}`
  )
})
