import { test, describe } from 'node:test'
import assert from 'node:assert'
import { transform } from '../transformer.js'

describe('Plain Classes Without Decorators', () => {
  test('should handle plain class without decorators', () => {
    class PlainUser {
      id: number
      name: string
      email: string
      age: number
      isActive: boolean
      tags: string[]
      createdAt: Date
    }

    try {
      const result = transform(PlainUser)

      // Verify basic structure
      assert.strictEqual(result.name, 'PlainUser')
      assert.strictEqual(result.schema.type, 'object')

      // Check if properties are detected
      const properties = result.schema.properties
      assert.ok(properties.id, 'Should have id property')
      assert.ok(properties.name, 'Should have name property')
      assert.ok(properties.email, 'Should have email property')
      assert.ok(properties.age, 'Should have age property')
      assert.ok(properties.isActive, 'Should have isActive property')
      assert.ok(properties.tags, 'Should have tags property')
      assert.ok(properties.createdAt, 'Should have createdAt property')
    } catch (error) {
      console.error(
        'Error transforming plain class:',
        error instanceof Error ? error.message : String(error)
      )
      throw error
    }
  })
})
