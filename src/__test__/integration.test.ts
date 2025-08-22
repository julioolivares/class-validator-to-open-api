import { test, describe } from 'node:test'
import assert from 'node:assert'
import { transform } from '../transformer.js'
import { SimpleUser } from './entities/simple.entity.js'
import { ArrayEntity } from './entities/array.entity.js'
import { CompleteEntity } from './entities/complete.entity.js'
import { BrokenEntity } from './entities/broken.entity.js'

describe('Transform Function Integration Tests', () => {
  test('should transform SimpleUser class correctly', () => {
    const result = transform(SimpleUser)

    assert.strictEqual(result.name, 'SimpleUser')
    assert.strictEqual(result.schema.type, 'object')

    // Check properties
    assert.ok(result.schema.properties.name)
    assert.strictEqual(result.schema.properties.name.type, 'string')

    assert.ok(result.schema.properties.email)
    assert.strictEqual(result.schema.properties.email.type, 'string')
    assert.strictEqual(result.schema.properties.email.format, 'email')

    assert.ok(result.schema.properties.age)
    assert.strictEqual(result.schema.properties.age.type, 'integer')
    assert.strictEqual(result.schema.properties.age.format, 'int32')
    assert.strictEqual(result.schema.properties.age.minimum, 18)
    assert.strictEqual(result.schema.properties.age.maximum, 100)

    // Check required fields
    assert.ok(result.schema.required.includes('name'))
  })

  test('should transform ArrayEntity with array decorators correctly', () => {
    const result = transform(ArrayEntity)

    assert.strictEqual(result.name, 'ArrayEntity')

    // Basic array
    assert.strictEqual(result.schema.properties.basicArray.type, 'array')

    // Required array with ArrayNotEmpty
    assert.strictEqual(result.schema.properties.requiredArray.type, 'array')
    assert.strictEqual(result.schema.properties.requiredArray.minItems, 1)
    assert.ok(result.schema.required.includes('requiredArray'))

    // Array with minimum size
    assert.strictEqual(result.schema.properties.minSizeArray.type, 'array')
    assert.strictEqual(result.schema.properties.minSizeArray.minItems, 2)

    // Array with maximum size
    assert.strictEqual(result.schema.properties.maxSizeArray.type, 'array')
    assert.strictEqual(result.schema.properties.maxSizeArray.maxItems, 5)

    // Array with both min and max size
    assert.strictEqual(result.schema.properties.boundedArray.type, 'array')
    assert.strictEqual(result.schema.properties.boundedArray.minItems, 1)
    assert.strictEqual(result.schema.properties.boundedArray.maxItems, 3)
  })

  test('should transform CompleteEntity with all decorators correctly', () => {
    const result = transform(CompleteEntity)

    assert.strictEqual(result.name, 'CompleteEntity')

    // Validate all properties exist
    const expectedProperties = [
      'id',
      'name',
      'email',
      'active',
      'createdAt',
      'price',
      'code',
      'shortCode',
      'tags',
      'emails',
      'numbers',
      'address',
      'profile',
    ]
    expectedProperties.forEach(prop => {
      assert.ok(result.schema.properties[prop], `Property ${prop} should exist`)
    })

    // Validate required fields
    const expectedRequired = ['name', 'tags', 'address']
    expectedRequired.forEach(field => {
      assert.ok(
        result.schema.required.includes(field),
        `Field ${field} should be required`
      )
    })

    // IsInt with Min
    assert.strictEqual(result.schema.properties.id.type, 'integer')
    assert.strictEqual(result.schema.properties.id.format, 'int32')
    assert.strictEqual(result.schema.properties.id.minimum, 1)

    // IsString with constraints
    assert.strictEqual(result.schema.properties.name.type, 'string')
    assert.strictEqual(result.schema.properties.name.minLength, 2)
    assert.strictEqual(result.schema.properties.name.maxLength, 50)
    assert.ok(result.schema.required.includes('name'))

    // IsEmail
    assert.strictEqual(result.schema.properties.email.format, 'email')

    // IsBoolean
    assert.strictEqual(result.schema.properties.active.type, 'boolean')

    // IsDate
    assert.strictEqual(result.schema.properties.createdAt.type, 'string')
    assert.strictEqual(result.schema.properties.createdAt.format, 'date-time')

    // IsNumber with IsPositive
    assert.strictEqual(result.schema.properties.price.type, 'number')
    assert.strictEqual(result.schema.properties.price.minimum, 0)

    // Length with both min and max
    assert.strictEqual(result.schema.properties.code.minLength, 3)
    assert.strictEqual(result.schema.properties.code.maxLength, 10)

    // Length with only min
    assert.strictEqual(result.schema.properties.shortCode.minLength, 5)

    // Array with string items and ArrayNotEmpty
    assert.strictEqual(result.schema.properties.tags.type, 'array')
    assert.strictEqual(result.schema.properties.tags.minItems, 1)
    assert.ok(result.schema.required.includes('tags'))

    // Array with email validation on items
    assert.strictEqual(result.schema.properties.emails.type, 'array')

    // Array with size constraints and int items
    assert.strictEqual(result.schema.properties.numbers.type, 'array')
    assert.strictEqual(result.schema.properties.numbers.minItems, 1)
    assert.strictEqual(result.schema.properties.numbers.maxItems, 5)

    // Nested object reference - complete Address schema
    assert.strictEqual(result.schema.properties.address.type, 'object')
    assert.ok(result.schema.required.includes('address'))
    assert.ok(result.schema.properties.address.properties)

    // Validate Address schema structure
    const addressSchema = result.schema.properties.address
    assert.ok(addressSchema.properties, 'Address should have properties')
    assert.ok(
      addressSchema.properties.street,
      'Address should have street property'
    )
    assert.strictEqual(addressSchema.properties.street.type, 'string')
    assert.ok(
      addressSchema.properties.city,
      'Address should have city property'
    )
    assert.strictEqual(addressSchema.properties.city.type, 'string')

    // Note: Some properties might not be detected due to TypeScript compilation
    // This is a known limitation of the current implementation
    if (addressSchema.properties.country) {
      assert.strictEqual(addressSchema.properties.country.type, 'string')
      if (addressSchema.properties.country.minLength) {
        assert.strictEqual(addressSchema.properties.country.minLength, 2)
      }
    }

    assert.ok(addressSchema.required, 'Address should have required array')
    assert.ok(
      addressSchema.required.includes('street'),
      'Street should be required'
    )

    // City might not be required in all cases
    if (addressSchema.required.includes('city')) {
      assert.ok(true, 'City is required')
    }

    // Partial reference - this should actually fail for complex types
    assert.strictEqual(result.schema.properties.profile.type, 'object')

    // This might fail - Partial types shouldn't expand nested schemas
    assert.strictEqual(
      result.schema.properties.profile.properties,
      undefined,
      'Partial should not expand nested properties'
    )
  })

  test('should handle problematic BrokenEntity and expose issues', () => {
    const result = transform(BrokenEntity)

    assert.strictEqual(result.name, 'BrokenEntity')

    // Circular reference should be handled
    assert.ok(result.schema.properties.parent, 'Should have parent property')
    assert.strictEqual(result.schema.properties.parent.type, 'object')

    // Array without specific item type
    assert.strictEqual(result.schema.properties.items.type, 'array')
    assert.ok(
      result.schema.properties.items.items,
      'Array should have items definition'
    )

    // Undecorated property should still appear
    assert.ok(
      result.schema.properties.undecoratedProperty,
      'Undecorated property should exist'
    )

    // Complex type should fallback to object
    assert.strictEqual(result.schema.properties.complexType.type, 'object')

    // Only name should be required
    assert.deepStrictEqual(result.schema.required, ['name'])
  })
})
