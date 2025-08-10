import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SchemaTransformer } from './index.js';
import { SimpleUser } from '../test-entities/simple.entity.js';
import { ArrayEntity } from '../test-entities/array.entity.js';

describe('SchemaTransformer Integration Tests', () => {
  test('should transform SimpleUser class correctly', () => {
    const transformer = new SchemaTransformer();
    const result = transformer.transform(SimpleUser);
    
    assert.strictEqual(result.name, 'SimpleUser');
    assert.strictEqual(result.schema.type, 'object');
    
    // Check properties
    assert.ok(result.schema.properties.name);
    assert.strictEqual(result.schema.properties.name.type, 'string');
    
    assert.ok(result.schema.properties.email);
    assert.strictEqual(result.schema.properties.email.type, 'string');
    assert.strictEqual(result.schema.properties.email.format, 'email');
    
    assert.ok(result.schema.properties.age);
    assert.strictEqual(result.schema.properties.age.type, 'integer');
    assert.strictEqual(result.schema.properties.age.format, 'int32');
    assert.strictEqual(result.schema.properties.age.minimum, 18);
    assert.strictEqual(result.schema.properties.age.maximum, 100);
    
    // Check required fields
    assert.ok(result.schema.required.includes('name'));
  });

  test('should transform ArrayEntity with array decorators correctly', () => {
    const transformer = new SchemaTransformer();
    const result = transformer.transform(ArrayEntity);
    
    assert.strictEqual(result.name, 'ArrayEntity');
    
    // Basic array
    assert.strictEqual(result.schema.properties.basicArray.type, 'array');
    
    // Required array with ArrayNotEmpty
    assert.strictEqual(result.schema.properties.requiredArray.type, 'array');
    assert.strictEqual(result.schema.properties.requiredArray.minItems, 1);
    assert.ok(result.schema.required.includes('requiredArray'));
    
    // Array with minimum size
    assert.strictEqual(result.schema.properties.minSizeArray.type, 'array');
    assert.strictEqual(result.schema.properties.minSizeArray.minItems, 2);
    
    // Array with maximum size
    assert.strictEqual(result.schema.properties.maxSizeArray.type, 'array');
    assert.strictEqual(result.schema.properties.maxSizeArray.maxItems, 5);
    
    // Array with both min and max size
    assert.strictEqual(result.schema.properties.boundedArray.type, 'array');
    assert.strictEqual(result.schema.properties.boundedArray.minItems, 1);
    assert.strictEqual(result.schema.properties.boundedArray.maxItems, 3);
  });
});