# 🔄 class-validator-to-open-api

✨ Transform TypeScript classes with class-validator decorators into OpenAPI schema objects.

## 🎯 Why Use This?

Perfect for projects where you need to:

- 🚀 **API Development**: Generate OpenAPI schemas from your existing validation classes
- 🧪 **Mock APIs**: Create realistic API documentation and mock servers
- 📚 **Documentation**: Auto-generate API docs from your TypeScript models
- 🔧 **Production Ready**: Maintain consistency between validation and API contracts
- ⚡ **No Runtime Dependencies**: Works without `reflect-metadata` or `emitDecoratorMetadata`

### 📋 About OpenAPI

**OpenAPI** (formerly known as Swagger) is a specification for describing REST APIs. It's the industry standard that allows developers to document their APIs in a structured, machine-readable format.

- **Current Version**: OpenAPI 3.1.0 ([Official Specification](https://spec.openapis.org/oas/v3.1.0))
- **What it does**: Defines the structure, endpoints, request/response formats, and validation rules of your API
- **Why it matters**: Enables automatic documentation generation, client SDK creation, API testing, and ensures consistency across your API ecosystem

This library generates OpenAPI 3.1.0 compatible schema objects from your TypeScript validation classes, bridging the gap between your code and API documentation.

### 💡 Common Use Cases

- **Express.js APIs**: Generate Swagger documentation from your DTOs
- **NestJS Projects**: Convert class-validator DTOs to OpenAPI schemas
- **API Testing**: Create mock data structures for testing
- **Microservices**: Ensure schema consistency across services
- **Legacy Projects**: Works with projects that can't enable `emitDecoratorMetadata`

## 📦 Installation

```bash
npm install class-validator-to-open-api class-validator
```

> **Note**: `class-validator` is required as a peer dependency for the decorators to work.

## ⚙️ Requirements

- Node.js >= 14.0.0
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
import { transform } from 'class-validator-to-open-api'
import { IsString, IsEmail, IsNotEmpty, IsInt, Min, Max } from 'class-validator'

// Define your class with validation decorators
class User {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsInt()
  @Min(18)
  @Max(100)
  age: number
}

// Transform the class to OpenAPI schema
const result = transform(User)

console.log(JSON.stringify(result, null, 2))
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

### File Upload Example

```typescript
import { transform } from 'class-validator-to-open-api'
import { IsNotEmpty, IsOptional } from 'class-validator'

// Define custom file type
class UploadFile {}

// Create your upload DTO
class ProfileUpload {
  @IsNotEmpty()
  profilePicture: UploadFile

  @IsOptional()
  resume: UploadFile
}

// Generate schema using convenience function
const schema = transform(ProfileUpload)

console.log(JSON.stringify(schema, null, 2))
```

**Output:**

```json
{
  "name": "ProfileUpload",
  "schema": {
    "type": "object",
    "properties": {
      "profilePicture": {
        "type": "string",
        "format": "binary"
      },
      "resume": {
        "type": "string",
        "format": "binary"
      }
    },
    "required": ["profilePicture"]
  }
}
```

### Complex Example with Nested Objects and Arrays

```typescript
import {
  IsString,
  IsInt,
  IsEmail,
  IsDate,
  IsArray,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  ArrayNotEmpty,
} from 'class-validator'

class Role {
  @IsInt()
  @IsNotEmpty()
  id: number

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string
}

class User {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  id: number

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @IsEmail()
  email: string

  @IsArray()
  @ArrayNotEmpty()
  tags: string[]

  @IsDate()
  createdAt: Date

  @IsNotEmpty()
  role: Role // Nested object

  files: Buffer[] // Binary files

  @IsNotEmpty()
  avatar: UploadFile // Custom file upload type
}

const schema = transform(User)
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
      },
      "avatar": {
        "type": "string",
        "format": "binary"
      }
    },
    "required": ["id", "tags", "role", "avatar"]
  }
}
```

## 🎨 Supported Decorators

### Type Decorators

| Decorator      | Schema Property                       |
| -------------- | ------------------------------------- |
| `@IsString()`  | `type: "string"`                      |
| `@IsInt()`     | `type: "integer", format: "int32"`    |
| `@IsNumber()`  | `type: "number", format: "double"`    |
| `@IsBoolean()` | `type: "boolean"`                     |
| `@IsEmail()`   | `type: "string", format: "email"`     |
| `@IsDate()`    | `type: "string", format: "date-time"` |

### Validation Decorators

| Decorator           | Schema Property                  |
| ------------------- | -------------------------------- |
| `@IsNotEmpty()`     | Adds to `required` array         |
| `@MinLength(n)`     | `minLength: n`                   |
| `@MaxLength(n)`     | `maxLength: n`                   |
| `@Length(min, max)` | `minLength: min, maxLength: max` |
| `@Min(n)`           | `minimum: n`                     |
| `@Max(n)`           | `maximum: n`                     |
| `@IsPositive()`     | `minimum: 0` (≥ 0)               |

### Array Decorators

| Decorator          | Schema Property          |
| ------------------ | ------------------------ |
| `@IsArray()`       | `type: "array"`          |
| `@ArrayNotEmpty()` | `minItems: 1` + required |
| `@ArrayMinSize(n)` | `minItems: n`            |
| `@ArrayMaxSize(n)` | `maxItems: n`            |

### Special Types

| TypeScript Type | OpenAPI Schema                        |
| --------------- | ------------------------------------- |
| `Date`          | `type: "string", format: "date-time"` |
| `Buffer`        | `type: "string", format: "binary"`    |
| `Uint8Array`    | `type: "string", format: "binary"`    |
| `UploadFile`    | `type: "string", format: "binary"`    |
| `CustomClass`   | Nested object schema                  |
| `Type[]`        | Array with typed items                |

### 📁 Custom File Types

The library supports custom file upload types that are automatically mapped to binary format:

```typescript
import { transform } from 'class-validator-to-open-api'
import { IsNotEmpty, IsArray } from 'class-validator'

// Define your custom file type
class UploadFile {}

class DocumentUpload {
  @IsNotEmpty()
  document: UploadFile // Single file upload

  @IsArray()
  attachments: UploadFile[] // Multiple file uploads

  avatar: UploadFile // Optional file upload
}

// Transform to OpenAPI schema
const schema = transform(DocumentUpload)
console.log(JSON.stringify(schema, null, 2))
```

**Generated Schema:**

```json
{
  "name": "DocumentUpload",
  "schema": {
    "type": "object",
    "properties": {
      "document": {
        "type": "string",
        "format": "binary"
      },
      "attachments": {
        "type": "array",
        "items": {
          "type": "string",
          "format": "binary"
        }
      },
      "avatar": {
        "type": "string",
        "format": "binary"
      }
    },
    "required": ["document"]
  }
}
```

## 📖 API Reference

### ⚡ `transform(cls: Function)`

Transforms a class constructor function into an OpenAPI schema object. Uses an internal singleton for optimal performance.

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
import { transform } from 'class-validator-to-open-api'
import { User } from './entities/user.js'

const schema = transform(User)
console.log(JSON.stringify(schema, null, 2))
```

## 🚀 Features

- ✅ **No Runtime Dependencies**: Uses TypeScript Compiler API instead of reflect-metadata
- ✅ **Singleton Pattern**: Optimized performance with shared instance and caching
- ✅ **Nested Objects**: Automatically handles complex object relationships
- ✅ **Array Support**: Full support for typed arrays with validation
- ✅ **Built-in Caching**: Avoids reprocessing the same classes
- ✅ **Type Safety**: Full TypeScript support with proper type definitions
- ✅ **Flexible**: Works with any TypeScript project configuration
- ✅ **Comprehensive**: Supports all major class-validator decorators
- ✅ **Simple API**: Multiple usage patterns for different needs

## 🔧 Migration from reflect-metadata

If you're migrating from a solution that requires `reflect-metadata`:

1. Remove `reflect-metadata` imports from your entities
2. Remove `emitDecoratorMetadata: true` from tsconfig.json (optional)
3. Update your transformation code to use the new API

```typescript
// Before (with reflect-metadata)
import 'reflect-metadata'
const schema = transformClass(User)

// After (with this package)
import { transform } from 'class-validator-to-open-api'
import { User } from './entities/user.js'
const schema = transform(User)
```

## 🔧 Troubleshooting

### Common Issues

**Error: "Cannot find module 'class-validator'"**

```bash
npm install class-validator
```

**Error: "Experimental decorators warning"**
Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

**Empty schema generated**

- Ensure your class has class-validator decorators
- Check that the class is properly exported/imported
- Verify TypeScript compilation is working

**Nested objects not working**

- Make sure nested classes are in the same project
- Ensure nested classes have their own decorators
- Check file paths and imports

## 📄 License

MIT
