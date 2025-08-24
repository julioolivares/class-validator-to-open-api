import { test, describe } from 'node:test'
import assert from 'node:assert'
import { SchemaTransformer } from '../transformer.js'
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator'
import { OptionalPropertiesUser } from './entities/optional-properties.entity.js'

describe('Optional Properties Tests', () => {
  test('should correctly identify required and optional properties based on TypeScript optional operator', () => {
    // Clear any existing instance to ensure clean state
    SchemaTransformer.clearInstance()

    const transformer = SchemaTransformer.getInstance()
    const result = transformer.transform(OptionalPropertiesUser)

    assert.strictEqual(result.name, 'OptionalPropertiesUser')
    assert.strictEqual(result.schema.type, 'object')
    assert(result.schema.properties)
    assert(result.schema.required)

    // Properties that should be required:
    // - name (no ? operator, no decorators)
    // - email (no ? operator, has IsNotEmpty)
    // - age (no ? operator, has decorators but no IsNotEmpty)
    // - requiredButOptionalSyntax (has ? but also has IsNotEmpty which overrides)
    // - username (no ? operator, no decorators)
    const expectedRequired = [
      'email', // Has IsNotEmpty decorator
      'age', // No ? operator and has decorators
      'requiredButOptionalSyntax', // IsNotEmpty overrides ? operator
      'name', // No ? operator, no decorators
      'username', // No ? operator, no decorators
    ]

    // Properties that should NOT be required:
    // - nickname (has ? operator, no decorators)
    // - middleName (has ? operator, has IsOptional)
    // - score (has ? operator, has decorators but no IsNotEmpty)
    // - bio (has ? operator, no decorators)
    const expectedOptional = ['nickname', 'middleName', 'score', 'bio']

    // Check that all expected required properties are in the required array
    for (const prop of expectedRequired) {
      assert(
        result.schema.required.includes(prop),
        `Property ${prop} should be required`
      )
    }

    // Check that optional properties are NOT in the required array
    for (const prop of expectedOptional) {
      assert(
        !result.schema.required.includes(prop),
        `Property ${prop} should be optional`
      )
    }

    // Verify specific property types and formats
    assert.strictEqual(result.schema.properties.name.type, 'string')
    assert.strictEqual(result.schema.properties.nickname.type, 'string')
    assert.strictEqual(result.schema.properties.email.type, 'string')
    assert.strictEqual(result.schema.properties.middleName.type, 'string')
    assert.strictEqual(result.schema.properties.age.type, 'integer')
    assert.strictEqual(result.schema.properties.score.type, 'integer')
    assert.strictEqual(result.schema.properties.bio.type, 'string')
    assert.strictEqual(result.schema.properties.username.type, 'string')

    // Verify decorator constraints are still applied
    assert.strictEqual(result.schema.properties.age.minimum, 18)
    assert.strictEqual(result.schema.properties.age.maximum, 100)
    assert.strictEqual(result.schema.properties.score.minimum, 0)
  })

  test('should handle properties with only TypeScript optional operator (no class-validator decorators)', () => {
    // Clear any existing instance to ensure clean state
    SchemaTransformer.clearInstance()

    const transformer = SchemaTransformer.getInstance()

    class PlainTypeScriptClass {
      requiredProp: string
      optionalProp?: string
      requiredNumber: number
      optionalNumber?: number
    }

    const result = transformer.transform(PlainTypeScriptClass)

    // Required properties (no ? operator)
    assert(
      result.schema.required.includes('requiredProp'),
      'requiredProp should be required'
    )
    assert(
      result.schema.required.includes('requiredNumber'),
      'requiredNumber should be required'
    )

    // Optional properties (has ? operator)
    assert(
      !result.schema.required.includes('optionalProp'),
      'optionalProp should be optional'
    )
    assert(
      !result.schema.required.includes('optionalNumber'),
      'optionalNumber should be optional'
    )

    // All properties should exist in the schema
    assert(result.schema.properties.requiredProp)
    assert(result.schema.properties.optionalProp)
    assert(result.schema.properties.requiredNumber)
    assert(result.schema.properties.optionalNumber)
  })

  test('should prioritize IsNotEmpty decorator over TypeScript optional operator', () => {
    // Clear any existing instance to ensure clean state
    SchemaTransformer.clearInstance()

    const transformer = SchemaTransformer.getInstance()

    class MixedOptionalClass {
      @IsString()
      @IsNotEmpty()
      requiredEvenIfOptional?: string // Should be required due to IsNotEmpty

      @IsString()
      optionalWithDecorator?: string // Should be optional despite having decorators
    }

    const result = transformer.transform(MixedOptionalClass)

    // IsNotEmpty should override the ? operator
    assert(
      result.schema.required.includes('requiredEvenIfOptional'),
      'requiredEvenIfOptional should be required due to IsNotEmpty'
    )

    // Should remain optional since no IsNotEmpty
    assert(
      !result.schema.required.includes('optionalWithDecorator'),
      'optionalWithDecorator should remain optional'
    )
  })

  test('should work correctly with nested objects and optional properties', () => {
    // Clear any existing instance to ensure clean state
    SchemaTransformer.clearInstance()

    const transformer = SchemaTransformer.getInstance()

    class Address {
      street: string
      city?: string
    }

    class UserWithAddress {
      name: string
      address?: Address
      @IsNotEmpty()
      requiredAddress: Address
    }

    const result = transformer.transform(UserWithAddress)

    // name and requiredAddress should be required
    assert(result.schema.required.includes('name'), 'name should be required')
    assert(
      result.schema.required.includes('requiredAddress'),
      'requiredAddress should be required'
    )

    // address should be optional
    assert(
      !result.schema.required.includes('address'),
      'address should be optional'
    )

    // All properties should exist
    assert(result.schema.properties.name)
    assert(result.schema.properties.address)
    assert(result.schema.properties.requiredAddress)
  })

  test('should demonstrate backward compatibility with existing class-validator decorators', () => {
    // Clear any existing instance to ensure clean state
    SchemaTransformer.clearInstance()

    const transformer = SchemaTransformer.getInstance()

    class LegacyClass {
      // Old behavior: only marked as required with IsNotEmpty
      @IsString()
      description: string // This will now be required due to no ? operator

      @IsString()
      @IsNotEmpty()
      name: string // This remains required due to IsNotEmpty

      // New behavior: respects TypeScript optional syntax
      @IsString()
      nickname?: string // This is optional due to ? operator
    }

    const result = transformer.transform(LegacyClass)

    // Both description and name should be required now
    assert(
      result.schema.required.includes('description'),
      'description should be required (no ? operator)'
    )
    assert(
      result.schema.required.includes('name'),
      'name should be required (IsNotEmpty)'
    )

    // nickname should be optional
    assert(
      !result.schema.required.includes('nickname'),
      'nickname should be optional (? operator)'
    )
  })
})
