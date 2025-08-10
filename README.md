# 🔄 class-validator-to-open-api

✨ Transform TypeScript classes with class-validator decorators into OpenAPI schema objects. 

## 🎯 Why Use This?

Perfect for projects where you need to:
- 🚀 **API Development**: Generate OpenAPI schemas from your existing validation classes
- 🧪 **Mock APIs**: Create realistic API documentation and mock servers
- 📚 **Documentation**: Auto-generate API docs from your TypeScript models
- 🔧 **Production Ready**: Maintain consistency between validation and API contracts
- ⚡ **No Runtime Dependencies**: Works without `reflect-metadata` or `emitDecoratorMetadata`

### 💡 Common Use Cases

- **Express.js APIs**: Generate Swagger documentation from your DTOs
- **NestJS Projects**: Convert class-validator DTOs to OpenAPI schemas
- **API Testing**: Create mock data structures for testing
- **Microservices**: Ensure schema consistency across services
- **Legacy Projects**: Works with projects that can't enable `emitDecoratorMetadata`

## 📦 Installation

```bash
npm install class-validator-to-open-api
```

## ⚙️ Requirements

- Node.js >= 16.0.0
- TypeScript with minimal compiler options in `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "experimentalDecorators": true
    }
  }
  ```

> **Note**: Unlike other solutions, this package does **NOT** require `emitDecoratorMetadata: true` or `reflect-metadata`.

## 🚀 Usage

### Basic Usage

```typescript
import { SchemaTransformer } from 'class-validator-to-open-api';
import { IsString, IsEmail, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

// Define your class with validation decorators
class User {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(18)
  @Max(100)
  age: number;
}

// Option 1: Transform with imported class (recommended)
import { User } from './entities/user.js';
const transformer = new SchemaTransformer();
const result = transformer.transform(User);

console.log(result);
```

**Output:**
```json
{
  "name": "User",
  "schema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "age": {
        "type": "integer",
        "format": "int32",
        "minimum": 18,
        "maximum": 100
      }
    },
    "required": ["name"]
  }
}
```

### Complex Example with Nested Objects and Arrays

```typescript
import { 
  IsString, IsInt, IsEmail, IsDate, IsArray, IsNotEmpty,
  MinLength, MaxLength, Min, Max, ArrayNotEmpty 
} from 'class-validator';

class Role {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}

class User {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  id: number;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsArray()
  @ArrayNotEmpty()
  tags: string[];

  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  role: Role; // Nested object

  files: Buffer[]; // Binary files
}

const transformer = new SchemaTransformer();
import { User } from './entities/user.js';
const schema = transformer.transform(User);
```

**Output:**
```json
{
  "name": "User",
  "schema": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "format": "int32",
        "minimum": 1
      },
      "name": {
        "type": "string",
        "minLength": 2,
        "maxLength": 100
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "minItems": 1
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      },
      "role": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 50
          }
        },
        "required": ["id"]
      },
      "files": {
        "type": "array",
        "items": {
          "type": "string",
          "format": "binary"
        }
      }
    },
    "required": ["id", "tags", "role"]
  }
}
```

## 🎨 Supported Decorators

### Type Decorators
| Decorator | Schema Property |
|-----------|----------------|
| `@IsString()` | `type: "string"` |
| `@IsInt()` | `type: "integer", format: "int32"` |
| `@IsNumber()` | `type: "number"` |
| `@IsBoolean()` | `type: "boolean"` |
| `@IsEmail()` | `type: "string", format: "email"` |
| `@IsDate()` | `type: "string", format: "date-time"` |

### Validation Decorators
| Decorator | Schema Property |
|-----------|----------------|
| `@IsNotEmpty()` | Adds to `required` array |
| `@MinLength(n)` | `minLength: n` |
| `@MaxLength(n)` | `maxLength: n` |
| `@Length(min, max)` | `minLength: min, maxLength: max` |
| `@Min(n)` | `minimum: n` |
| `@Max(n)` | `maximum: n` |
| `@IsPositive()` | `minimum: 0` |

### Array Decorators
| Decorator | Schema Property |
|-----------|----------------|
| `@IsArray()` | `type: "array"` |
| `@ArrayNotEmpty()` | `minItems: 1` + required |
| `@ArrayMinSize(n)` | `minItems: n` |
| `@ArrayMaxSize(n)` | `maxItems: n` |

### Special Types
| TypeScript Type | OpenAPI Schema |
|-----------------|----------------|
| `Date` | `type: "string", format: "date-time"` |
| `Buffer` | `type: "string", format: "binary"` |
| `Uint8Array` | `type: "string", format: "binary"` |
| `CustomClass` | Nested object schema |
| `Type[]` | Array with typed items |

## 📖 API Reference

### 🏗️ `SchemaTransformer`

#### 🔧 Constructor
```typescript
new SchemaTransformer(filePath?: string)
```

**Parameters:**
- `filePath` - Optional path to a specific TypeScript file to include in analysis

**Example:**
```typescript
// Analyze entire project
const transformer = new SchemaTransformer();

// Focus on specific file
const transformer = new SchemaTransformer('./entities/user.ts');
```

#### 📋 Methods

##### ⚡ `transform(cls: Function)`
Transforms a class constructor function into an OpenAPI schema object.

**Parameters:**
- `cls` - The class constructor function to transform

**Returns:**
```typescript
{
  name: string;
  schema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  }
}
```

**Example:**
```typescript
import { User } from './entities/user.js';
const schema = transformer.transform(User);
```

## 🚀 Features

- ✅ **No Runtime Dependencies**: Uses TypeScript Compiler API instead of reflect-metadata
- ✅ **Nested Objects**: Automatically handles complex object relationships
- ✅ **Array Support**: Full support for typed arrays with validation
- ✅ **Caching**: Built-in caching for improved performance
- ✅ **Type Safety**: Full TypeScript support with proper type definitions
- ✅ **Flexible**: Works with any TypeScript project configuration
- ✅ **Comprehensive**: Supports all major class-validator decorators
- ✅ **Simple API**: Single public method for easy integration

## 🔧 Migration from reflect-metadata

If you're migrating from a solution that requires `reflect-metadata`:

1. Remove `reflect-metadata` imports from your entities
2. Remove `emitDecoratorMetadata: true` from tsconfig.json (optional)
3. Update your transformation code to use the new API

```typescript
// Before (with reflect-metadata)
import 'reflect-metadata';
const schema = transformClass(User);

// After (with this package)
import { User } from './entities/user.js';
const transformer = new SchemaTransformer();
const schema = transformer.transform(User);
```

## 📄 License

MIT