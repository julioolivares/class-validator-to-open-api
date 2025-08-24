# 🔄 ts-class-to-openapi

✨ **Transform TypeScript classes into OpenAPI 3.1.0 schema objects**

A powerful library that automatically converts your TypeScript classes into OpenAPI-compatible schemas. Works with **pure TypeScript classes** and **class-validator decorated classes**, with zero runtime dependencies.

> **🎯 New Feature**: Now supports **pure TypeScript classes** without requiring any decorators or external dependencies! Perfect for transforming existing codebases instantly.

## 🚀 Key Features

- ✅ **Pure TypeScript Support** - Transform any TypeScript class without decorators
- ✅ **class-validator Compatible** - Enhanced schemas with validation decorators
- ✅ **CommonJS & ESM Compatible** - Works in any Node.js project
- ✅ **Zero Runtime Dependencies** - No `reflect-metadata` or `emitDecoratorMetadata` required
- ✅ **OpenAPI 3.1.0** - Industry-standard schema generation
- ✅ **TypeScript Native** - Full type support and safety
- ✅ **High Performance** - Singleton pattern with built-in caching
- ✅ **Nested Objects** - Handles complex relationships automatically
- ✅ **Typed Arrays** - Full support for arrays with validation
- ✅ **File Uploads** - Binary file upload support

## 🎯 Why Use This Library?

Perfect for projects where you need to:

- 🌐 **REST APIs**: Generate Swagger documentation from your existing TypeScript classes
- 📚 **Auto Documentation**: Maintain consistency between TypeScript types and API contracts
- 🧪 **API Testing**: Create mock data structures for testing
- 🔧 **Microservices**: Ensure schema consistency across services
- ⚡ **Legacy Projects**: Works without enabling `emitDecoratorMetadata`
- 🎯 **Pure TypeScript**: Transform classes without any decorators
- 🔍 **Enhanced Validation**: Add class-validator decorators for richer schemas

### 📋 About OpenAPI

**OpenAPI** (formerly Swagger) is the industry standard specification for describing REST APIs in a structured, machine-readable format. This library generates **OpenAPI 3.1.0** compatible schemas from your TypeScript classes.

**Benefits:**

- Automatic documentation generation
- Client SDK generation
- API testing automation
- Consistency across your API ecosystem

## 📦 Installation

```bash
# Using npm
npm install ts-class-to-openapi

# Using yarn
yarn add ts-class-to-openapi

# Using pnpm
pnpm add ts-class-to-openapi
```

### For class-validator Enhanced Features

If you want to use class-validator decorators for enhanced validation schemas:

```bash
# Using npm
npm install ts-class-to-openapi class-validator

# Using yarn
yarn add ts-class-to-openapi class-validator

# Using pnpm
pnpm add ts-class-to-openapi class-validator
```

> **Note**: `class-validator` is only required if you want to use validation decorators. Pure TypeScript classes work without it.

## 🔧 Module Compatibility

This library is **100% compatible with both CommonJS and ESM**, allowing you to use it in any modern Node.js project.

### ESM (ES Modules) - Recommended

```typescript
// ESM import
import { transform } from 'ts-class-to-openapi'
import { IsString, IsEmail, IsNotEmpty } from 'class-validator'

class User {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string
}

const schema = transform(User)
console.log(JSON.stringify(schema, null, 2))
```

### TypeScript with CommonJS

```typescript
// TypeScript with CommonJS configuration
import { transform } from 'ts-class-to-openapi'
import { IsString, IsEmail, IsNotEmpty } from 'class-validator'

class User {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string
}

const schema = transform(User)
console.log(JSON.stringify(schema, null, 2))
```

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

> **Note**: The `experimentalDecorators` option is only required if you plan to use class-validator decorators. Pure TypeScript classes work without any special configuration.

## 🎨 Two Transformation Modes

### 1. Pure TypeScript Classes

Transform any TypeScript class without requiring any decorators or external dependencies:

```typescript
import { transform } from 'ts-class-to-openapi'

// Pure TypeScript - no decorators needed
class Product {
  id: number
  name: string
  price: number
  inStock: boolean
  categories: string[]
  metadata: Record<string, any>
  createdAt: Date
}

const schema = transform(Product)
```

**Benefits:**

- ✅ No external dependencies required
- ✅ Works with existing TypeScript codebases
- ✅ Zero configuration needed
- ✅ Automatic type inference
- ✅ Perfect for legacy projects

### 2. Enhanced with class-validator

Add validation decorators for richer, more detailed schemas:

```typescript
import { transform } from 'ts-class-to-openapi'
import {
  IsString,
  IsNumber,
  IsPositive,
  IsArray,
  IsNotEmpty,
} from 'class-validator'

// Enhanced with validation decorators
class Product {
  @IsNumber()
  @IsPositive()
  id: number

  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsPositive()
  price: number

  @IsArray()
  categories: string[]
}

const schema = transform(Product)
```

**Benefits:**

- ✅ Rich validation constraints
- ✅ Required field specification
- ✅ Format validation (email, date, etc.)
- ✅ String length constraints
- ✅ Number range validation
- ✅ Array size validation

## 🚀 Quick Start

### Pure TypeScript Classes

Transform any TypeScript class without requiring decorators:

```typescript
import { transform } from 'ts-class-to-openapi'

// Pure TypeScript class - no decorators needed!
class User {
  id: number
  name: string
  email: string
  age: number
  isActive: boolean
  tags: string[]
  createdAt: Date
}

// Transform the class to OpenAPI schema
const result = transform(User)
console.log(JSON.stringify(result, null, 2))
```

**Generated Output:**

```json
{
  "name": "User",
  "schema": {
    "type": "object",
    "properties": {
      "id": {
        "type": "number"
      },
      "name": {
        "type": "string"
      },
      "email": {
        "type": "string"
      },
      "age": {
        "type": "number"
      },
      "isActive": {
        "type": "boolean"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  }
}
```

### Enhanced with class-validator Decorators

For more detailed validation schemas, add class-validator decorators:

```typescript
import { transform } from 'ts-class-to-openapi'
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

**Generated Output:**

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

### Express.js + Swagger UI Example

```typescript
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { transform } from 'ts-class-to-openapi'
import { IsString, IsEmail, IsNotEmpty, IsInt, Min, Max } from 'class-validator'

// Define your DTOs with validation decorators
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

class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string
}

const app = express()

// Generate schemas from your classes
const userSchema = transform(User)
const createUserSchema = transform(CreateUserDto)

// Create OpenAPI specification
const swaggerSpec = {
  openapi: '3.1.0',
  info: { title: 'My API', version: '1.0.0' },
  components: {
    schemas: {
      [userSchema.name]: userSchema.schema,
      [createUserSchema.name]: createUserSchema.schema,
    },
  },
}

// Setup Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.listen(3000, () => {
  console.log('API docs available at http://localhost:3000/api-docs')
})
```

### File Upload Example

```typescript
import { transform } from 'ts-class-to-openapi'
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

// Generate schema
const schema = transform(ProfileUpload)
console.log(JSON.stringify(schema, null, 2))
```

**Generated Output:**

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

### Advanced Example with Nested Objects and Arrays

#### Pure TypeScript Classes

```typescript
import { transform } from 'ts-class-to-openapi'

class Role {
  id: number
  name: string
  permissions: string[]
}

class Address {
  street: string
  city: string
  country: string
  zipCode: string
}

class User {
  id: number
  name: string
  email: string
  age: number
  isActive: boolean
  tags: string[]
  createdAt: Date
  role: Role // Nested object
  addresses: Address[] // Array of objects
  files: Buffer[] // Binary files
}

const schema = transform(User)
```

#### Enhanced with class-validator

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

**Generated Output:**

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

> **Note**: Unlike other solutions, this package does **NOT** require `emitDecoratorMetadata: true` or `reflect-metadata`.

## 📊 Pure TypeScript vs Enhanced Mode Comparison

| Feature                | Pure TypeScript                       | Enhanced (class-validator)           |
| ---------------------- | ------------------------------------- | ------------------------------------ |
| **Dependencies**       | Zero                                  | Requires `class-validator`           |
| **Configuration**      | None                                  | `experimentalDecorators: true`       |
| **Type Detection**     | Automatic                             | Automatic + Decorators               |
| **Validation Rules**   | Basic types only                      | Rich validation constraints          |
| **Required Fields**    | None (all optional)                   | Specified by decorators              |
| **String Constraints** | None                                  | Min/max length, patterns             |
| **Number Constraints** | None                                  | Min/max values, positive             |
| **Array Constraints**  | None                                  | Min/max items, non-empty             |
| **Email Validation**   | None                                  | Email format validation              |
| **Date Handling**      | `date-time` format                    | `date-time` format                   |
| **Use Case**           | Existing codebases, rapid prototyping | APIs with validation, robust schemas |

### Example Comparison

**Pure TypeScript Class:**

```typescript
class User {
  name: string
  email: string
  age: number
}
// Generates: All properties optional, basic types
```

**Enhanced Class:**

```typescript
class User {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsInt()
  @Min(18)
  age: number
}
// Generates: name required, email format validation, age minimum 18
```

## 🎨 Supported Decorators Reference

### Type Validation Decorators

| Decorator      | Generated Schema Property             | Description                 |
| -------------- | ------------------------------------- | --------------------------- |
| `@IsString()`  | `type: "string"`                      | String type validation      |
| `@IsInt()`     | `type: "integer", format: "int32"`    | Integer type validation     |
| `@IsNumber()`  | `type: "number", format: "double"`    | Number type validation      |
| `@IsBoolean()` | `type: "boolean"`                     | Boolean type validation     |
| `@IsEmail()`   | `type: "string", format: "email"`     | Email format validation     |
| `@IsDate()`    | `type: "string", format: "date-time"` | Date-time format validation |

### String Validation Decorators

| Decorator           | Generated Schema Property        | Description           |
| ------------------- | -------------------------------- | --------------------- |
| `@IsNotEmpty()`     | Adds to `required` array         | Field is required     |
| `@MinLength(n)`     | `minLength: n`                   | Minimum string length |
| `@MaxLength(n)`     | `maxLength: n`                   | Maximum string length |
| `@Length(min, max)` | `minLength: min, maxLength: max` | String length range   |

### Number Validation Decorators

| Decorator       | Generated Schema Property | Description           |
| --------------- | ------------------------- | --------------------- |
| `@Min(n)`       | `minimum: n`              | Minimum numeric value |
| `@Max(n)`       | `maximum: n`              | Maximum numeric value |
| `@IsPositive()` | `minimum: 0`              | Positive number (≥ 0) |

### Array Validation Decorators

| Decorator          | Generated Schema Property | Description                 |
| ------------------ | ------------------------- | --------------------------- |
| `@IsArray()`       | `type: "array"`           | Array type validation       |
| `@ArrayNotEmpty()` | `minItems: 1` + required  | Non-empty array requirement |
| `@ArrayMinSize(n)` | `minItems: n`             | Minimum array size          |
| `@ArrayMaxSize(n)` | `maxItems: n`             | Maximum array size          |

### Special Type Mappings

| TypeScript Type | Generated OpenAPI Schema              | Description                    |
| --------------- | ------------------------------------- | ------------------------------ |
| `Date`          | `type: "string", format: "date-time"` | ISO date-time string           |
| `Buffer`        | `type: "string", format: "binary"`    | Binary data                    |
| `Uint8Array`    | `type: "string", format: "binary"`    | Binary array                   |
| `UploadFile`    | `type: "string", format: "binary"`    | Custom file upload type        |
| `CustomClass`   | Nested object schema                  | Recursive class transformation |
| `Type[]`        | Array with typed items                | Array of specific type         |

### Automatic TypeScript Type Detection

The library automatically detects and converts TypeScript types:

```typescript
class AutoDetectionExample {
  // Primitives
  id: number // → type: "number"
  name: string // → type: "string"
  isActive: boolean // → type: "boolean"

  // Special types
  createdAt: Date // → type: "string", format: "date-time"
  file: Buffer // → type: "string", format: "binary"

  // Arrays
  tags: string[] // → type: "array", items: { type: "string" }
  scores: number[] // → type: "array", items: { type: "number" }

  // Objects
  metadata: object // → type: "object"
  data: any // → No schema constraints

  // Nested classes (automatically transformed)
  profile: UserProfile // → Nested object schema
}
```

## 📁 File Upload Support

The library provides built-in support for file uploads with automatic binary format mapping:

```typescript
import { transform } from 'ts-class-to-openapi'
import { IsNotEmpty, IsArray, IsOptional } from 'class-validator'

// Define your custom file type
class UploadFile {}

class DocumentUpload {
  @IsNotEmpty()
  document: UploadFile // Single file upload (required)

  @IsArray()
  attachments: UploadFile[] // Multiple file uploads

  @IsOptional()
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

### Supported File Types

The following types are automatically converted to binary format:

- `Buffer` - Node.js Buffer objects
- `Uint8Array` - Typed arrays
- `UploadFile` - Custom file upload classes
- Any class ending with "File" suffix (e.g., `ImageFile`, `VideoFile`)

## 📖 API Reference

### `transform(cls: Function)`

Transforms a class constructor function into an OpenAPI schema object.

**Parameters:**

- `cls: Function` - The class constructor function to transform

**Returns:**

```typescript
{
  name: string;        // Class name
  schema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  }
}
```

**Example:**

```typescript
import { transform } from 'ts-class-to-openapi'
import { User } from './entities/user.js'

const result = transform(User)
console.log(result.name) // "User"
console.log(result.schema) // OpenAPI schema object
```

## 🌟 Advanced Features

- ✅ **Pure TypeScript Support** - Works with any TypeScript class, no decorators required
- ✅ **Zero Runtime Dependencies** - Uses TypeScript Compiler API instead of reflect-metadata
- ✅ **High Performance** - Singleton pattern with built-in caching for repeated transformations
- ✅ **Nested Object Support** - Automatically handles complex object relationships
- ✅ **Array Type Support** - Full support for typed arrays with validation constraints
- ✅ **Built-in Caching** - Avoids reprocessing the same classes multiple times
- ✅ **Type Safety** - Complete TypeScript support with proper type definitions
- ✅ **Framework Agnostic** - Works with any TypeScript project configuration
- ✅ **Comprehensive Coverage** - Supports all major class-validator decorators
- ✅ **Flexible Usage** - Use with or without validation decorators

## 🔄 Migration Guide

### From reflect-metadata Solutions

If you're migrating from a solution that requires `reflect-metadata`:

**Before (with reflect-metadata):**

```typescript
import 'reflect-metadata'
import { getMetadataStorage } from 'class-validator'

// Complex setup required
const schema = transformClassToSchema(User)
```

**After (with ts-class-to-openapi):**

```typescript
import { transform } from 'ts-class-to-openapi'

// Simple, clean API
const schema = transform(User)
```

### New: Pure TypeScript Support

The biggest advantage is that you can now transform **any TypeScript class** without requiring decorators:

**Before (required decorators):**

```typescript
// This would NOT work with traditional solutions
class LegacyUser {
  id: number
  name: string
  email: string
}
```

**Now (works immediately):**

```typescript
import { transform } from 'ts-class-to-openapi'

// This works out of the box!
class LegacyUser {
  id: number
  name: string
  email: string
}

const schema = transform(LegacyUser) // ✅ Works perfectly
```

### Migration Steps

1. **Remove reflect-metadata imports** from your entities
2. **Remove `emitDecoratorMetadata: true`** from tsconfig.json (optional)
3. **Update transformation code** to use the new API
4. **Remove reflect-metadata dependency** from package.json
5. **Optional**: Keep decorators for enhanced validation or remove them entirely

### TypeScript Configuration

You only need minimal TypeScript configuration:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
    // emitDecoratorMetadata: true ← NOT REQUIRED!
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**Error: "Cannot find module 'ts-class-to-openapi'"**

```bash
npm install ts-class-to-openapi
```

**Error: "Cannot find module 'class-validator'"**

This is only needed if you want to use validation decorators:

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

- For pure TypeScript classes: Ensure your class has properly typed properties
- For class-validator enhanced: Ensure your class has class-validator decorators
- Check that the class is properly exported/imported
- Verify TypeScript compilation is working

**Works without decorators but want validation?**

Pure TypeScript classes work immediately, but if you want enhanced validation schemas:

1. Install class-validator: `npm install class-validator`
2. Add decorators to your properties
3. Enable `experimentalDecorators: true` in tsconfig.json

**Nested objects not working**

- Make sure nested classes are in the same project
- Ensure nested classes have their own decorators
- Check file paths and imports

## 📄 License

MIT
