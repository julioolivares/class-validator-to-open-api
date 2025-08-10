# 🔄 class-validator-to-open-api

✨ Transform TypeScript classes with class-validator decorators into OpenAPI schema objects.

## 🎯 Why Use This?

Perfect for projects where you need to:
- 🚀 **API Development**: Generate OpenAPI schemas from your existing validation classes
- 🧪 **Mock APIs**: Create realistic API documentation and mock servers
- 📚 **Documentation**: Auto-generate API docs from your TypeScript models
- 🔧 **Production Ready**: Maintain consistency between validation and API contracts

### 💡 Common Use Cases

- **Express.js APIs**: Generate Swagger documentation from your DTOs
- **NestJS Projects**: Convert class-validator DTOs to OpenAPI schemas
- **API Testing**: Create mock data structures for testing
- **Microservices**: Ensure schema consistency across services

## 📦 Installation

```bash
npm install class-validator-to-open-api
```

## ⚙️ Requirements

- Node.js >= 16.0.0
- TypeScript with the following compiler options in `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true
    }
  }
  ```

## 🚀 Usage

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

// Transform to OpenAPI schema
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

## 🎨 Supported Decorators

| Decorator | Schema Property |
|-----------|----------------|
| `@IsString()` | `type: "string"` |
| `@IsInt()` | `type: "integer", format: "int32"` |
| `@IsNumber()` | `type: "number"` |
| `@IsBoolean()` | `type: "boolean"` |
| `@IsEmail()` | `format: "email"` |
| `@IsDate()` | `format: "date-time"` |
| `@IsNotEmpty()` | Adds to `required` array |
| `@MinLength(n)` | `minLength: n` |
| `@MaxLength(n)` | `maxLength: n` |
| `@Length(min, max)` | `minLength: min, maxLength: max` |
| `@Min(n)` | `minimum: n` |
| `@Max(n)` | `maximum: n` |
| `@IsPositive()` | `minimum: 0` |
| `@ArrayNotEmpty()` | `minItems: 1` + required |
| `@ArrayMinSize(n)` | `minItems: n` |
| `@ArrayMaxSize(n)` | `maxItems: n` |

## 📖 API

### 🏗️ `SchemaTransformer`

#### 🔧 Constructor
```typescript
new SchemaTransformer(tsConfigPath?: string)
```
- `tsConfigPath` - Path to TypeScript configuration file (default: `./tsconfig.json`)

#### 📋 Methods

##### ⚡ `transform(cls: Function)`
Transforms a class into an OpenAPI schema object.

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

## 📄 License

MIT