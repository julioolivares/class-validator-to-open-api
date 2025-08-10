import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SchemaTransformer } from './index.js';
import ts from 'typescript';

describe('SchemaTransformer', () => {
  let transformer: SchemaTransformer;

  beforeEach(() => {
    transformer = new SchemaTransformer();
  });

  test('constructor should create instance with default tsconfig', () => {
    assert.ok(transformer instanceof SchemaTransformer);
  });

  test('constructor should throw error with invalid tsconfig path', () => {
    assert.throws(() => {
      new SchemaTransformer('/invalid/path/tsconfig.json');
    }, /Error reading tsconfig file/);
  });

  test('transform should throw error for non-existent class', () => {
    class NonExistentClass {}
    
    try {
      transformer.transform(NonExistentClass);
      assert.fail('Expected error to be thrown');
    } catch (error: any) {
      assert.ok(error instanceof Error);
    }
  });

  test('mapTypeToSchema should handle primitive types', () => {
    const stringResult = (transformer as any).mapTypeToSchema('string');
    assert.deepStrictEqual(stringResult, { type: 'string' });

    const numberResult = (transformer as any).mapTypeToSchema('number');
    assert.deepStrictEqual(numberResult, { type: 'number' });

    const booleanResult = (transformer as any).mapTypeToSchema('boolean');
    assert.deepStrictEqual(booleanResult, { type: 'boolean' });
  });

  test('mapTypeToSchema should handle Date type', () => {
    const result = (transformer as any).mapTypeToSchema('date');
    assert.deepStrictEqual(result, { 
      type: 'string', 
      format: 'date-time' 
    });
  });

  test('mapTypeToSchema should handle Buffer type', () => {
    const result = (transformer as any).mapTypeToSchema('buffer');
    assert.deepStrictEqual(result, { 
      type: 'string', 
      format: 'binary' 
    });
  });

  test('mapTypeToSchema should handle array types', () => {
    const result = (transformer as any).mapTypeToSchema('string[]');
    assert.strictEqual(result.type, 'array');
    assert.ok(result.nestedSchema);
    assert.strictEqual(result.nestedSchema.type, 'array');
    assert.deepStrictEqual(result.nestedSchema.items, { type: 'string' });
  });

  test('getDecoratorName should extract decorator name from call expression', () => {
    const mockCallExpression = {
      expression: { 
        kind: ts.SyntaxKind.Identifier,
        text: 'IsString' 
      }
    };
    const result = (transformer as any).getDecoratorName(mockCallExpression);
    assert.strictEqual(result, 'IsString');
  });

  test('getDecoratorName should return "unknown" for unidentifiable decorators', () => {
    const mockCallExpression = {
      expression: {}
    };
    const result = (transformer as any).getDecoratorName(mockCallExpression);
    assert.strictEqual(result, 'unknown');
  });

  test('getDecoratorArguments should parse arguments', () => {
    const mockCallExpression = {
      arguments: [
        { text: '5', kind: ts.SyntaxKind.NumericLiteral },
        { text: 'test', kind: ts.SyntaxKind.StringLiteral },
        { kind: ts.SyntaxKind.TrueKeyword },
        { kind: ts.SyntaxKind.FalseKeyword }
      ]
    };

    const result = (transformer as any).getDecoratorArguments(mockCallExpression);
    assert.deepStrictEqual(result, [5, 'test', true, false]);
  });

  test('applyDecorators should handle IsString decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'IsString', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'name');
    assert.strictEqual(schema.properties.name.type, 'string');
  });

  test('applyDecorators should handle IsNotEmpty decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'IsNotEmpty', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'name');
    assert.ok(schema.required.includes('name'));
  });

  test('applyDecorators should handle MinLength decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'MinLength', arguments: [5] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'name');
    assert.strictEqual(schema.properties.name.minLength, 5);
  });

  test('applyDecorators should handle MaxLength decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'MaxLength', arguments: [100] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'name');
    assert.strictEqual(schema.properties.name.maxLength, 100);
  });

  test('applyDecorators should handle Min decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { age: { type: 'number' } },
      required: []
    };
    const decorators = [{ name: 'Min', arguments: [18] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'age');
    assert.strictEqual(schema.properties.age.minimum, 18);
  });

  test('applyDecorators should handle Max decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { age: { type: 'number' } },
      required: []
    };
    const decorators = [{ name: 'Max', arguments: [100] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'age');
    assert.strictEqual(schema.properties.age.maximum, 100);
  });

  test('applyDecorators should handle IsEmail decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { email: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'IsEmail', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'email');
    assert.strictEqual(schema.properties.email.format, 'email');
  });

  test('applyDecorators should handle IsArray decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { tags: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'IsArray', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'tags');
    assert.strictEqual(schema.properties.tags.type, 'array');
  });

  test('applyDecorators should handle ArrayNotEmpty decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { tags: { type: 'array' } },
      required: []
    };
    const decorators = [{ name: 'ArrayNotEmpty', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'tags');
    assert.strictEqual(schema.properties.tags.minItems, 1);
    assert.ok(schema.required.includes('tags'));
  });

  test('applyDecorators should handle ArrayMinSize decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { tags: { type: 'array' } },
      required: []
    };
    const decorators = [{ name: 'ArrayMinSize', arguments: [3] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'tags');
    assert.strictEqual(schema.properties.tags.minItems, 3);
  });

  test('applyDecorators should handle ArrayMaxSize decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { tags: { type: 'array' } },
      required: []
    };
    const decorators = [{ name: 'ArrayMaxSize', arguments: [10] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'tags');
    assert.strictEqual(schema.properties.tags.maxItems, 10);
  });

  test('generateSchema should create basic schema structure', () => {
    const properties = [
      {
        name: 'name',
        type: 'string',
        decorators: [{ name: 'IsString', arguments: [] }]
      }
    ];
    
    const result = (transformer as any).generateSchema(properties);
    assert.strictEqual(result.type, 'object');
    assert.ok(result.properties);
    assert.ok(Array.isArray(result.required));
    assert.strictEqual(result.properties.name.type, 'string');
  });

  test('applyDecorators should handle IsInt decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { count: { type: 'number' } },
      required: []
    };
    const decorators = [{ name: 'IsInt', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'count');
    assert.strictEqual(schema.properties.count.type, 'integer');
    assert.strictEqual(schema.properties.count.format, 'int32');
  });

  test('applyDecorators should handle IsNumber decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { price: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'IsNumber', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'price');
    assert.strictEqual(schema.properties.price.type, 'number');
  });

  test('applyDecorators should handle IsBoolean decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { active: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'IsBoolean', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'active');
    assert.strictEqual(schema.properties.active.type, 'boolean');
  });

  test('applyDecorators should handle IsDate decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { createdAt: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'IsDate', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'createdAt');
    assert.strictEqual(schema.properties.createdAt.type, 'string');
    assert.strictEqual(schema.properties.createdAt.format, 'date-time');
  });

  test('applyDecorators should handle IsPositive decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { amount: { type: 'number' } },
      required: []
    };
    const decorators = [{ name: 'IsPositive', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'amount');
    assert.strictEqual(schema.properties.amount.minimum, 0);
  });

  test('applyDecorators should handle Length decorator', () => {
    const schema: any = {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'Length', arguments: [3, 10] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'code');
    assert.strictEqual(schema.properties.code.minLength, 3);
    assert.strictEqual(schema.properties.code.maxLength, 10);
  });

  test('applyDecorators should handle Length decorator with single argument', () => {
    const schema: any = {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: []
    };
    const decorators = [{ name: 'Length', arguments: [5] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'code');
    assert.strictEqual(schema.properties.code.minLength, 5);
    assert.strictEqual(schema.properties.code.maxLength, undefined);
  });

  test('applyDecorators should handle decorators on array items', () => {
    const schema: any = {
      type: 'object',
      properties: { emails: { type: 'array', items: { type: 'string' } } },
      required: []
    };
    const decorators = [{ name: 'IsEmail', arguments: [] }];
    
    (transformer as any).applyDecorators(decorators, schema, 'emails');
    assert.strictEqual(schema.properties.emails.items.format, 'email');
  });

  test('cache should store and retrieve transformed classes', () => {
    const mockResult = { name: 'TestClass', schema: { type: 'object', properties: {}, required: [] } };
    
    (transformer as any).classCache.set('TestClass', mockResult);
    const cached = (transformer as any).classCache.get('TestClass');
    
    assert.deepStrictEqual(cached, mockResult);
  });
});