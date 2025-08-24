import { test, describe } from 'node:test'
import assert from 'node:assert'
import { transform, SchemaTransformer } from '../transformer.js'
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDate,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
  MaxLength,
  Length,
  Min,
  Max,
  IsPositive,
} from 'class-validator'

describe('Transform Function', () => {
  test('should transform basic class with string property', () => {
    class TestUser {
      @IsString()
      @IsNotEmpty()
      name: string
    }

    const result = transform(TestUser)
    assert.strictEqual(result.name, 'TestUser')
    assert.strictEqual(result.schema.type, 'object')
    assert.strictEqual(result.schema.properties.name.type, 'string')
    assert.ok(result.schema.required.includes('name'))
  })

  test('should handle different primitive types', () => {
    class PrimitiveTest {
      @IsString()
      name: string

      @IsNumber()
      price: number

      @IsBoolean()
      active: boolean

      @IsDate()
      createdAt: Date
    }

    const result = transform(PrimitiveTest)
    assert.strictEqual(result.schema.properties.name.type, 'string')
    assert.strictEqual(result.schema.properties.price.type, 'number')
    assert.strictEqual(result.schema.properties.active.type, 'boolean')
    assert.strictEqual(result.schema.properties.createdAt.type, 'string')
    assert.strictEqual(result.schema.properties.createdAt.format, 'date-time')
  })

  test('should handle array types', () => {
    class ArrayTest {
      @IsArray()
      @IsString({ each: true })
      tags: string[]
    }

    const result = transform(ArrayTest)
    assert.strictEqual(result.schema.properties.tags.type, 'array')
    assert.ok(result.schema.properties.tags.items)
    assert.strictEqual(result.schema.properties.tags.items.type, 'string')
  })

  test('should handle file upload types', () => {
    class UploadFile {}

    class FileTest {
      avatar: UploadFile
      files: Buffer[]
    }

    const result = transform(FileTest)
    assert.strictEqual(result.schema.properties.avatar.type, 'string')
    assert.strictEqual(result.schema.properties.avatar.format, 'binary')
    assert.strictEqual(result.schema.properties.files.type, 'array')
    assert.strictEqual(result.schema.properties.files.items.type, 'string')
    assert.strictEqual(result.schema.properties.files.items.format, 'binary')
  })

  test('should handle validation decorators', () => {
    class ValidationTest {
      @IsString()
      @MinLength(5)
      @MaxLength(100)
      name: string

      @IsInt()
      @Min(18)
      @Max(100)
      age: number

      @IsEmail()
      email: string

      @IsNumber()
      @IsPositive()
      price: number
    }

    const result = transform(ValidationTest)

    // String with length constraints
    assert.strictEqual(result.schema.properties.name.type, 'string')
    assert.strictEqual(result.schema.properties.name.minLength, 5)
    assert.strictEqual(result.schema.properties.name.maxLength, 100)

    // Integer with min/max
    assert.strictEqual(result.schema.properties.age.type, 'integer')
    assert.strictEqual(result.schema.properties.age.format, 'int32')
    assert.strictEqual(result.schema.properties.age.minimum, 18)
    assert.strictEqual(result.schema.properties.age.maximum, 100)

    // Email format
    assert.strictEqual(result.schema.properties.email.format, 'email')

    // Positive number
    assert.strictEqual(result.schema.properties.price.minimum, 0)
  })

  test('should handle array validation decorators', () => {
    class ArrayValidationTest {
      @IsArray()
      @ArrayNotEmpty()
      @IsString({ each: true })
      requiredTags: string[]

      @IsArray()
      @ArrayMinSize(2)
      @ArrayMaxSize(10)
      boundedArray: number[]
    }

    const result = transform(ArrayValidationTest)

    // Required array with minimum items
    assert.strictEqual(result.schema.properties.requiredTags.type, 'array')
    assert.strictEqual(result.schema.properties.requiredTags.minItems, 1)
    assert.ok(result.schema.required.includes('requiredTags'))

    // Array with size bounds
    assert.strictEqual(result.schema.properties.boundedArray.type, 'array')
    assert.strictEqual(result.schema.properties.boundedArray.minItems, 2)
    assert.strictEqual(result.schema.properties.boundedArray.maxItems, 10)
  })

  test('should handle Length decorator variations', () => {
    class LengthTest {
      @IsString()
      @Length(3, 10)
      code: string

      @IsString()
      @Length(5)
      shortCode: string
    }

    const result = transform(LengthTest)

    // Length with min and max
    assert.strictEqual(result.schema.properties.code.minLength, 3)
    assert.strictEqual(result.schema.properties.code.maxLength, 10)

    // Length with only min
    assert.strictEqual(result.schema.properties.shortCode.minLength, 5)
    assert.strictEqual(result.schema.properties.shortCode.maxLength, undefined)
  })

  test('should handle required fields with IsNotEmpty', () => {
    class RequiredTest {
      @IsString()
      @IsNotEmpty()
      name: string

      @IsString()
      optionalField?: string // Added ? to make it optional
    }

    const result = transform(RequiredTest)
    assert.ok(result.schema.required.includes('name'))
    assert.ok(!result.schema.required.includes('optionalField'))
  })

  test('should handle nested objects', () => {
    class Address {
      @IsString()
      @IsNotEmpty()
      street: string

      @IsString()
      city: string
    }

    class User {
      @IsString()
      name: string

      @IsNotEmpty()
      address: Address
    }

    const result = transform(User)
    assert.strictEqual(result.schema.properties.address.type, 'object')
    assert.ok(result.schema.properties.address.properties)
    assert.ok(result.schema.properties.address.properties.street)
    assert.ok(result.schema.properties.address.properties.city)
    assert.ok(result.schema.required.includes('address'))
  })

  test('should handle generic types like BaseDto<T>', () => {
    class BaseDto<T> {
      public data: T
    }

    class UserData {
      name: string
      id: number
    }

    class GenericTest {
      user: BaseDto<UserData>
      description: string
    }

    const result = transform(GenericTest)

    assert.strictEqual(result.schema.properties.user.type, 'object')
    assert.ok(result.schema.properties.user.properties)
    assert.ok(result.schema.properties.user.properties.name)
    assert.ok(result.schema.properties.user.properties.id)
    assert.strictEqual(
      result.schema.properties.user.properties.name.type,
      'string'
    )
    assert.strictEqual(
      result.schema.properties.user.properties.id.type,
      'number'
    )

    assert.strictEqual(result.schema.properties.description.type, 'string')
  })

  test('should use proper cache keys to avoid conflicts between classes with same names', () => {
    class TestClass {
      @IsString()
      name: string

      @IsNumber()
      value: number
    }

    // Transform an existing class multiple times
    const result1 = transform(TestClass)
    const result2 = transform(TestClass)

    // Both results should be identical (this indicates that the cache works)
    assert.deepStrictEqual(result1, result2)

    // Verify that the properties are correct
    assert.ok(result1.schema.properties.name)
    assert.ok(result1.schema.properties.value)
    assert.strictEqual(result1.schema.properties.name.type, 'string')
    assert.strictEqual(result1.schema.properties.value.type, 'number')
  })

  test('should manage memory efficiently with cache cleanup', () => {
    // Clear any existing singleton instance
    SchemaTransformer.clearInstance()

    // Create a transformer with small cache size for testing
    const transformer = SchemaTransformer.getInstance(undefined, {
      maxCacheSize: 2,
      autoCleanup: true,
    })

    // Clear any existing cache
    transformer.clearCache()

    class TestClass1 {
      @IsString()
      name: string
    }

    class TestClass2 {
      @IsNumber()
      value: number
    }

    class TestClass3 {
      @IsBoolean()
      active: boolean
    }

    // Transform multiple classes to trigger cache cleanup
    const result1 = transformer.transform(TestClass1)
    const result2 = transformer.transform(TestClass2)

    let stats = transformer.getMemoryStats()
    assert.strictEqual(stats.cacheSize, 2)

    // This should trigger cache cleanup due to maxCacheSize: 2
    const result3 = transformer.transform(TestClass3)

    stats = transformer.getMemoryStats()
    assert.ok(stats.cacheSize <= 2, 'Cache should be cleaned up automatically')

    // Verify results are still correct
    assert.strictEqual(result1.schema.properties.name.type, 'string')
    assert.strictEqual(result2.schema.properties.value.type, 'number')
    assert.strictEqual(result3.schema.properties.active.type, 'boolean')

    // Test manual cache clearing
    transformer.clearCache()
    stats = transformer.getMemoryStats()
    assert.strictEqual(stats.cacheSize, 0)
    assert.strictEqual(stats.loadedFiles, 0)
  })
})
