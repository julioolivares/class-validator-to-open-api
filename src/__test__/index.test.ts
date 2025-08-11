import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert'
import { SchemaTransformer } from '../index.js'
import ts from 'typescript'
import {
  type SchemaType,
  type DecoratorInfo,
  type PropertyInfo,
} from '../types.js'

// Test helper class to expose private methods
class TestableSchemaTransformer extends SchemaTransformer {
  public testMapTypeToSchema(type: string) {
    return (this as any).mapTypeToSchema(type)
  }

  public testGetDecoratorName(callExpression: any) {
    return (this as any).getDecoratorName(callExpression)
  }

  public testGetDecoratorArguments(callExpression: any) {
    return (this as any).getDecoratorArguments(callExpression)
  }

  public testApplyDecorators(
    decorators: DecoratorInfo[],
    schema: SchemaType,
    propertyName: string
  ) {
    return (this as any).applyDecorators(decorators, schema, propertyName)
  }

  public testGenerateSchema(properties: PropertyInfo[]) {
    return (this as any).generateSchema(properties)
  }

  public get testClassCache() {
    return (this as any).classCache
  }
}

describe('SchemaTransformer', () => {
  let transformer: TestableSchemaTransformer

  beforeEach(() => {
    transformer = new TestableSchemaTransformer()
  })

  test('constructor should create instance with default tsconfig', () => {
    assert.ok(transformer instanceof SchemaTransformer)
  })

  test('constructor should throw error with invalid tsconfig path', () => {
    assert.throws(() => {
      new SchemaTransformer('/invalid/path/tsconfig.json')
    }, /Error reading tsconfig file/)
  })

  test('transform should throw error for non-existent class', () => {
    class NonExistentClass {}

    try {
      transformer.transform(NonExistentClass)
      assert.fail('Expected error to be thrown')
    } catch (error: any) {
      assert.ok(error instanceof Error)
    }
  })

  test('mapTypeToSchema should handle primitive types', () => {
    const stringResult = transformer.testMapTypeToSchema('string')
    assert.deepStrictEqual(stringResult, { type: 'string' })

    const numberResult = transformer.testMapTypeToSchema('number')
    assert.deepStrictEqual(numberResult, { type: 'number' })

    const booleanResult = transformer.testMapTypeToSchema('boolean')
    assert.deepStrictEqual(booleanResult, { type: 'boolean' })
  })

  test('mapTypeToSchema should handle Date type', () => {
    const result = transformer.testMapTypeToSchema('date')
    assert.deepStrictEqual(result, {
      type: 'string',
      format: 'date-time',
    })
  })

  test('mapTypeToSchema should handle Buffer type', () => {
    const result = transformer.testMapTypeToSchema('buffer')
    assert.deepStrictEqual(result, {
      type: 'string',
      format: 'binary',
    })
  })

  test('mapTypeToSchema should handle UploadFile type', () => {
    const result = transformer.testMapTypeToSchema('uploadfile')
    assert.deepStrictEqual(result, {
      type: 'string',
      format: 'binary',
    })
  })

  test('mapTypeToSchema should handle array types', () => {
    const result = transformer.testMapTypeToSchema('string[]')
    assert.strictEqual(result.type, 'array')
    assert.ok(result.nestedSchema)
    assert.strictEqual(result.nestedSchema.type, 'array')
    assert.deepStrictEqual(result.nestedSchema.items, { type: 'string' })
  })

  test('mapTypeToSchema should handle nested object types', () => {
    const result = transformer.testMapTypeToSchema('Address')
    assert.strictEqual(result.type, 'object')
    // This should actually fail - nested schema might not exist for non-existent classes
    assert.ok(result.nestedSchema, 'Should have nested schema for Address')
    assert.strictEqual(result.nestedSchema.type, 'object')
  })

  test('mapTypeToSchema should fail for non-existent nested types', () => {
    const result = transformer.testMapTypeToSchema('TotallyNonExistentClass123')
    // This should return basic object without nested schema
    assert.strictEqual(result.type, 'object')
    console.log(
      'Actual result for non-existent:',
      JSON.stringify(result, null, 2)
    )
    assert.strictEqual(
      result.nestedSchema,
      undefined,
      'Should not have nested schema for truly non-existent class'
    )
  })

  test('should handle circular references without infinite loops', () => {
    // This might cause infinite recursion
    const result = transformer.testMapTypeToSchema('BrokenEntity')
    assert.strictEqual(result.type, 'object')
    // Should not crash or loop infinitely
    assert.ok(result.nestedSchema || result.type === 'object')
  })

  test('mapTypeToSchema should handle Partial types as objects', () => {
    const result = transformer.testMapTypeToSchema('Partial<CompleteEntity>')
    assert.strictEqual(result.type, 'object')
  })

  test('getDecoratorName should extract decorator name from call expression', () => {
    const mockCallExpression = {
      expression: {
        kind: ts.SyntaxKind.Identifier,
        text: 'IsString',
      },
    }
    const result = transformer.testGetDecoratorName(mockCallExpression)
    assert.strictEqual(result, 'IsString')
  })

  test('getDecoratorName should return "unknown" for unidentifiable decorators', () => {
    const mockCallExpression = {
      expression: {},
    }
    const result = transformer.testGetDecoratorName(mockCallExpression)
    assert.strictEqual(result, 'unknown')
  })

  test('getDecoratorArguments should parse arguments', () => {
    const mockCallExpression = {
      arguments: [
        { text: '5', kind: ts.SyntaxKind.NumericLiteral },
        { text: 'test', kind: ts.SyntaxKind.StringLiteral },
        { kind: ts.SyntaxKind.TrueKeyword },
        { kind: ts.SyntaxKind.FalseKeyword },
      ],
    }

    const result = transformer.testGetDecoratorArguments(mockCallExpression)
    assert.deepStrictEqual(result, [5, 'test', true, false])
  })

  test('applyDecorators should handle IsString decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'IsString', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'name')
    assert.strictEqual(schema.properties.name.type, 'string')
  })

  test('applyDecorators should handle IsNotEmpty decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'IsNotEmpty', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'name')
    assert.ok(schema.required.includes('name'))
  })

  test('applyDecorators should handle MinLength decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'MinLength', arguments: [5] }]

    transformer.testApplyDecorators(decorators, schema, 'name')
    assert.strictEqual(schema.properties.name.minLength, 5)
  })

  test('applyDecorators should handle MaxLength decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'MaxLength', arguments: [100] }]

    transformer.testApplyDecorators(decorators, schema, 'name')
    assert.strictEqual(schema.properties.name.maxLength, 100)
  })

  test('applyDecorators should handle Min decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { age: { type: 'number' } },
      required: [],
    }
    const decorators = [{ name: 'Min', arguments: [18] }]

    transformer.testApplyDecorators(decorators, schema, 'age')
    assert.strictEqual(schema.properties.age.minimum, 18)
  })

  test('applyDecorators should handle Max decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { age: { type: 'number' } },
      required: [],
    }
    const decorators = [{ name: 'Max', arguments: [100] }]

    transformer.testApplyDecorators(decorators, schema, 'age')
    assert.strictEqual(schema.properties.age.maximum, 100)
  })

  test('applyDecorators should handle IsEmail decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { email: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'IsEmail', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'email')
    assert.strictEqual(schema.properties.email.format, 'email')
  })

  test('applyDecorators should handle IsArray decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { tags: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'IsArray', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'tags')
    assert.strictEqual(schema.properties.tags.type, 'array')
  })

  test('applyDecorators should handle ArrayNotEmpty decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { tags: { type: 'array' } },
      required: [],
    }
    const decorators = [{ name: 'ArrayNotEmpty', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'tags')
    assert.strictEqual(schema.properties.tags.minItems, 1)
    assert.ok(schema.required.includes('tags'))
  })

  test('applyDecorators should handle ArrayMinSize decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { tags: { type: 'array' } },
      required: [],
    }
    const decorators = [{ name: 'ArrayMinSize', arguments: [3] }]

    transformer.testApplyDecorators(decorators, schema, 'tags')
    assert.strictEqual(schema.properties.tags.minItems, 3)
  })

  test('applyDecorators should handle ArrayMaxSize decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { tags: { type: 'array' } },
      required: [],
    }
    const decorators = [{ name: 'ArrayMaxSize', arguments: [10] }]

    transformer.testApplyDecorators(decorators, schema, 'tags')
    assert.strictEqual(schema.properties.tags.maxItems, 10)
  })

  test('generateSchema should create basic schema structure', () => {
    const properties: PropertyInfo[] = [
      {
        name: 'name',
        type: 'string',
        decorators: [{ name: 'IsString', arguments: [] }],
      },
    ]

    const result = transformer.testGenerateSchema(properties)
    assert.strictEqual(result.type, 'object')
    assert.ok(result.properties)
    assert.ok(Array.isArray(result.required))
    assert.strictEqual(result.properties.name.type, 'string')
  })

  test('applyDecorators should handle IsInt decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { count: { type: 'number' } },
      required: [],
    }
    const decorators = [{ name: 'IsInt', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'count')
    assert.strictEqual(schema.properties.count.type, 'integer')
    assert.strictEqual(schema.properties.count.format, 'int32')
  })

  test('applyDecorators should handle IsNumber decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { price: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'IsNumber', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'price')
    assert.strictEqual(schema.properties.price.type, 'number')
  })

  test('applyDecorators should handle IsBoolean decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { active: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'IsBoolean', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'active')
    assert.strictEqual(schema.properties.active.type, 'boolean')
  })

  test('applyDecorators should handle IsDate decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { createdAt: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'IsDate', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'createdAt')
    assert.strictEqual(schema.properties.createdAt.type, 'string')
    assert.strictEqual(schema.properties.createdAt.format, 'date-time')
  })

  test('applyDecorators should handle IsPositive decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { amount: { type: 'number' } },
      required: [],
    }
    const decorators = [{ name: 'IsPositive', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'amount')
    assert.strictEqual(schema.properties.amount.minimum, 0)
  })

  test('applyDecorators should handle Length decorator', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'Length', arguments: [3, 10] }]

    transformer.testApplyDecorators(decorators, schema, 'code')
    assert.strictEqual(schema.properties.code.minLength, 3)
    assert.strictEqual(schema.properties.code.maxLength, 10)
  })

  test('applyDecorators should handle Length decorator with single argument', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: [],
    }
    const decorators = [{ name: 'Length', arguments: [5] }]

    transformer.testApplyDecorators(decorators, schema, 'code')
    assert.strictEqual(schema.properties.code.minLength, 5)
    assert.strictEqual(schema.properties.code.maxLength, undefined)
  })

  test('applyDecorators should handle decorators on array items', () => {
    const schema: SchemaType = {
      type: 'object',
      properties: { emails: { type: 'array', items: { type: 'string' } } },
      required: [],
    }
    const decorators = [{ name: 'IsEmail', arguments: [] }]

    transformer.testApplyDecorators(decorators, schema, 'emails')
    assert.strictEqual(schema.properties.emails.items.format, 'email')
  })

  test('cache should store and retrieve transformed classes', () => {
    const mockResult = {
      name: 'TestClass',
      schema: { type: 'object', properties: {}, required: [] },
    }

    transformer.testClassCache.set('TestClass', mockResult)
    const cached = transformer.testClassCache.get('TestClass')

    assert.deepStrictEqual(cached, mockResult)
  })

  test('should transform DocumentUpload class with UploadFile properties correctly', () => {
    const result = transformer.transform(
      class DocumentUpload {
        document: any // UploadFile type
        attachments: any[] // UploadFile[] type
        avatar: any // UploadFile type
      }
    )

    assert.strictEqual(result.name, 'DocumentUpload')
    assert.strictEqual(result.schema.type, 'object')
    assert.ok(result.schema.properties.document)
    assert.ok(result.schema.properties.attachments)
    assert.ok(result.schema.properties.avatar)
  })
})