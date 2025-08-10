import ts from "typescript";

import { constants } from "./fixtures.js";
import {
  type SchemaType,
  type DecoratorInfo,
  type PropertyInfo,
} from "./types.js";

/**
 * Transforms class-validator decorated classes into OpenAPI schema objects.
 * Analyzes TypeScript source files directly using the TypeScript compiler API.
 *
 * @example
 * ```typescript
 * const transformer = new SchemaTransformer('./entities/user.ts');
 * const schema = transformer.transformByName('User');
 * console.log(schema);
 * ```
 *
 * @public
 */
export class SchemaTransformer {
  /**
   * TypeScript program instance for analyzing source files.
   * @private
   */
  private program: ts.Program;

  /**
   * TypeScript type checker for resolving types.
   * @private
   */
  private checker: ts.TypeChecker;

  /**
   * Cache for storing transformed class schemas to avoid reprocessing.
   * @private
   */
  private classCache = new Map<string, any>();

  /**
   * Creates a new SchemaTransformer instance.
   *
   * @param tsConfigPath - Optional path to a specific TypeScript config file
   * @throws {Error} When TypeScript configuration cannot be loaded
   *
   * @example
   * ```typescript
   * // Transform classes from a specific file
   * const transformer = new SchemaTransformer('./entities/user.ts');
   *
   * // Transform classes from entire project
   * const transformer = new SchemaTransformer();
   * ```
   *
   * @public
   */
  constructor(tsConfigPath: string = constants.TS_CONFIG_DEFAULT_PATH) {
    const { config, error } = ts.readConfigFile(
      tsConfigPath || "tsconfig.json",
      ts.sys.readFile
    );

    if (error) {
      console.log(
        new Error(`Error reading tsconfig file: ${error.messageText}`).message
      );
      throw new Error(`Error reading tsconfig file: ${error.messageText}`);
    }

    const { options, fileNames } = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      "./"
    );

    this.program = ts.createProgram(fileNames, options);
    this.checker = this.program.getTypeChecker();
  }

  /**
   * Transforms a class by its name into an OpenAPI schema object.
   *
   * @param className - The name of the class to transform
   * @param filePath - Optional path to the file containing the class
   * @returns Object containing the class name and its corresponding JSON schema
   * @throws {Error} When the specified class cannot be found
   * @private
   */
  private transformByName(
    className: string,
    filePath?: string
  ): { name: string; schema: SchemaType } {
    if (this.classCache.has(className)) {
      return this.classCache.get(className);
    }

    const sourceFiles = filePath
      ? [this.program.getSourceFile(filePath)].filter(Boolean)
      : this.program.getSourceFiles().filter((sf) => !sf.isDeclarationFile);

    for (const sourceFile of sourceFiles) {
      const classNode = this.findClassByName(sourceFile!, className);
      if (classNode) {
        const result = this.transformClass(classNode);
        this.classCache.set(className, result);
        return result;
      }
    }

    throw new Error(`Class ${className} not found`);
  }

  /**
   * Transforms a class constructor function into an OpenAPI schema object.
   *
   * @param cls - The class constructor function to transform
   * @returns Object containing the class name and its corresponding JSON schema
   *
   * @example
   * ```typescript
   * import { User } from './entities/user.js';
   * const schema = transformer.transform(User);
   * ```
   *
   * @public
   */
  public transform(cls: Function): { name: string; schema: SchemaType } {
    return this.transformByName(cls.name);
  }

  /**
   * Finds a class declaration by name within a source file.
   *
   * @param sourceFile - The TypeScript source file to search in
   * @param className - The name of the class to find
   * @returns The class declaration node if found, undefined otherwise
   * @private
   */
  private findClassByName(
    sourceFile: ts.SourceFile,
    className: string
  ): ts.ClassDeclaration | undefined {
    let result: ts.ClassDeclaration | undefined;

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.name?.text === className) {
        result = node;
        return;
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return result;
  }

  /**
   * Transforms a TypeScript class declaration into a schema object.
   *
   * @param classNode - The TypeScript class declaration node
   * @returns Object containing class name and generated schema
   * @private
   */
  private transformClass(classNode: ts.ClassDeclaration): {
    name: string;
    schema: SchemaType;
  } {
    const className = classNode.name?.text || "Unknown";
    const properties = this.extractProperties(classNode);
    const schema = this.generateSchema(properties);

    return { name: className, schema };
  }

  /**
   * Extracts property information from a class declaration.
   *
   * @param classNode - The TypeScript class declaration node
   * @returns Array of property information including names, types, and decorators
   * @private
   */
  private extractProperties(classNode: ts.ClassDeclaration): PropertyInfo[] {
    const properties: PropertyInfo[] = [];

    for (const member of classNode.members) {
      if (
        ts.isPropertyDeclaration(member) &&
        member.name &&
        ts.isIdentifier(member.name)
      ) {
        const propertyName = member.name.text;
        const type = this.getPropertyType(member);
        const decorators = this.extractDecorators(member);

        properties.push({
          name: propertyName,
          type,
          decorators,
        });
      }
    }

    return properties;
  }

  /**
   * Gets the TypeScript type of a property as a string.
   *
   * @param property - The property declaration to analyze
   * @returns String representation of the property's type
   * @private
   */
  private getPropertyType(property: ts.PropertyDeclaration): string {
    if (property.type) {
      return this.getTypeNodeToString(property.type);
    }

    const type = this.checker.getTypeAtLocation(property);
    return this.checker.typeToString(type);
  }

  /**
   * Converts a TypeScript type node to its string representation.
   *
   * @param typeNode - The TypeScript type node to convert
   * @returns String representation of the type
   * @private
   */
  private getTypeNodeToString(typeNode: ts.TypeNode): string {
    if (
      ts.isTypeReferenceNode(typeNode) &&
      ts.isIdentifier(typeNode.typeName)
    ) {
      return typeNode.typeName.text;
    }

    switch (typeNode.kind) {
      case ts.SyntaxKind.StringKeyword:
        return constants.jsPrimitives.String.value;
      case ts.SyntaxKind.NumberKeyword:
        return constants.jsPrimitives.Number.value;
      case ts.SyntaxKind.BooleanKeyword:
        return constants.jsPrimitives.Boolean.value;
      case ts.SyntaxKind.ArrayType:
        const arrayType = typeNode as ts.ArrayTypeNode;
        return `${this.getTypeNodeToString(arrayType.elementType)}[]`;
      default:
        return typeNode.getText();
    }
  }

  /**
   * Extracts decorator information from a property declaration.
   *
   * @param member - The property declaration to analyze
   * @returns Array of decorator information including names and arguments
   * @private
   */
  private extractDecorators(member: ts.PropertyDeclaration): DecoratorInfo[] {
    const decorators: DecoratorInfo[] = [];

    if (member.modifiers) {
      for (const modifier of member.modifiers) {
        if (
          ts.isDecorator(modifier) &&
          ts.isCallExpression(modifier.expression)
        ) {
          const decoratorName = this.getDecoratorName(modifier.expression);
          const args = this.getDecoratorArguments(modifier.expression);
          decorators.push({ name: decoratorName, arguments: args });
        } else if (
          ts.isDecorator(modifier) &&
          ts.isIdentifier(modifier.expression)
        ) {
          decorators.push({ name: modifier.expression.text, arguments: [] });
        }
      }
    }

    return decorators;
  }

  /**
   * Gets the name of a decorator from a call expression.
   *
   * @param callExpression - The decorator call expression
   * @returns The decorator name or "unknown" if not identifiable
   * @private
   */
  private getDecoratorName(callExpression: ts.CallExpression): string {
    if (ts.isIdentifier(callExpression.expression)) {
      return callExpression.expression.text;
    }
    return "unknown";
  }

  /**
   * Extracts arguments from a decorator call expression.
   *
   * @param callExpression - The decorator call expression
   * @returns Array of parsed decorator arguments
   * @private
   */
  private getDecoratorArguments(callExpression: ts.CallExpression): any[] {
    return callExpression.arguments.map((arg) => {
      if (ts.isNumericLiteral(arg)) return Number(arg.text);
      if (ts.isStringLiteral(arg)) return arg.text;
      if (arg.kind === ts.SyntaxKind.TrueKeyword) return true;
      if (arg.kind === ts.SyntaxKind.FalseKeyword) return false;
      return arg.getText();
    });
  }

  /**
   * Generates an OpenAPI schema from extracted property information.
   *
   * @param properties - Array of property information to process
   * @returns Complete OpenAPI schema object with properties and validation rules
   * @private
   */
  private generateSchema(properties: PropertyInfo[]): SchemaType {
    const schema: SchemaType = {
      type: "object",
      properties: {},
      required: [],
    };

    for (const property of properties) {
      const { type, format, nestedSchema } = this.mapTypeToSchema(
        property.type
      );

      if (nestedSchema) {
        schema.properties[property.name] = nestedSchema;
      } else {
        schema.properties[property.name] = { type };
        if (format) schema.properties[property.name].format = format;
      }

      this.applyDecorators(property.decorators, schema, property.name);
    }

    return schema;
  }

  /**
   * Maps TypeScript types to OpenAPI schema types and formats.
   * Handles primitive types, arrays, and nested objects recursively.
   *
   * @param type - The TypeScript type string to map
   * @returns Object containing OpenAPI type, optional format, and nested schema
   * @private
   */
  private mapTypeToSchema(type: string): {
    type: string;
    format?: string;
    nestedSchema?: SchemaType;
  } {
    // Handle arrays
    if (type.endsWith("[]")) {
      const elementType = type.slice(0, -2);
      const elementSchema = this.mapTypeToSchema(elementType);
      const items: any = elementSchema.nestedSchema || {
        type: elementSchema.type,
      };
      if (elementSchema.format) items.format = elementSchema.format;

      return {
        type: "array",
        nestedSchema: {
          type: "array",
          items,
          properties: {},
          required: [],
        },
      };
    }

    // Handle primitives
    switch (type.toLowerCase()) {
      case constants.jsPrimitives.String.type.toLowerCase():
        return { type: constants.jsPrimitives.String.value };
      case constants.jsPrimitives.Number.type.toLowerCase():
        return { type: constants.jsPrimitives.Number.value };
      case constants.jsPrimitives.Boolean.type.toLowerCase():
        return { type: constants.jsPrimitives.Boolean.value };
      case constants.jsPrimitives.Date.type.toLowerCase():
        return {
          type: constants.jsPrimitives.Date.value,
          format: constants.jsPrimitives.Date.format,
        };
      case constants.jsPrimitives.Buffer.type.toLowerCase():
      case constants.jsPrimitives.Uint8Array.type.toLowerCase():
        return {
          type: constants.jsPrimitives.Buffer.value,
          format: constants.jsPrimitives.Buffer.format,
        };
      default:
        // Handle nested objects
        try {
          const nestedResult = this.transformByName(type);
          return {
            type: constants.jsPrimitives.Object.value,
            nestedSchema: nestedResult.schema,
          };
        } catch {
          return { type: constants.jsPrimitives.Object.value };
        }
    }
  }

  /**
   * Applies class-validator decorators to schema properties.
   * Maps validation decorators to their corresponding OpenAPI schema constraints.
   *
   * @param decorators - Array of decorator information to apply
   * @param schema - The schema object to modify
   * @param propertyName - Name of the property being processed
   * @private
   */
  private applyDecorators(
    decorators: DecoratorInfo[],
    schema: SchemaType,
    propertyName: string
  ): void {
    const isArrayType =
      schema.properties[propertyName].type ===
      constants.jsPrimitives.Array.value;

    for (const decorator of decorators) {
      const decoratorName = decorator.name;

      switch (decoratorName) {
        case constants.validatorDecorators.IsString.name:
          if (!isArrayType) {
            schema.properties[propertyName].type =
              constants.validatorDecorators.IsString.type;
          } else if (schema.properties[propertyName].items) {
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsString.type;
          }
          break;
        case constants.validatorDecorators.IsInt.name:
          if (!isArrayType) {
            schema.properties[propertyName].type =
              constants.validatorDecorators.IsInt.type;
            schema.properties[propertyName].format =
              constants.validatorDecorators.IsInt.format;
          } else if (schema.properties[propertyName].items) {
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsInt.type;
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsInt.format;
          }
          break;
        case constants.validatorDecorators.IsNumber.name:
          if (!isArrayType) {
            schema.properties[propertyName].type =
              constants.validatorDecorators.IsNumber.type;
          } else if (schema.properties[propertyName].items) {
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsNumber.type;
          }
          break;
        case constants.validatorDecorators.IsBoolean.name:
          if (!isArrayType) {
            schema.properties[propertyName].type =
              constants.validatorDecorators.IsBoolean.type;
          } else if (schema.properties[propertyName].items) {
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsBoolean.type;
          }
          break;
        case constants.validatorDecorators.IsEmail.name:
          if (!isArrayType) {
            schema.properties[propertyName].format =
              constants.validatorDecorators.IsEmail.format;
          } else if (schema.properties[propertyName].items) {
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsEmail.format;
          }
          break;
        case constants.validatorDecorators.IsDate.name:
          if (!isArrayType) {
            schema.properties[propertyName].type =
              constants.validatorDecorators.IsDate.type;
            schema.properties[propertyName].format =
              constants.validatorDecorators.IsDate.format;
          } else if (schema.properties[propertyName].items) {
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsDate.type;
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsDate.format;
          }
          break;
        case constants.validatorDecorators.IsNotEmpty.name:
          if (!schema.required.includes(propertyName)) {
            schema.required.push(propertyName);
          }
          break;
        case constants.validatorDecorators.MinLength.name:
          schema.properties[propertyName].minLength = decorator.arguments[0];
          break;
        case constants.validatorDecorators.MaxLength.name:
          schema.properties[propertyName].maxLength = decorator.arguments[0];
          break;
        case constants.validatorDecorators.Length.name:
          schema.properties[propertyName].minLength = decorator.arguments[0];
          if (decorator.arguments[1]) {
            schema.properties[propertyName].maxLength = decorator.arguments[1];
          }
          break;
        case constants.validatorDecorators.Min.name:
          schema.properties[propertyName].minimum = decorator.arguments[0];
          break;
        case constants.validatorDecorators.Max.name:
          schema.properties[propertyName].maximum = decorator.arguments[0];
          break;
        case constants.validatorDecorators.IsPositive.name:
          schema.properties[propertyName].minimum = 0;
          break;
        case constants.validatorDecorators.IsArray.name:
          schema.properties[propertyName].type = constants.jsPrimitives.Array.value;
          break;
        case constants.validatorDecorators.ArrayNotEmpty.name:
          schema.properties[propertyName].minItems = 1;
          if (!schema.required.includes(propertyName)) {
            schema.required.push(propertyName);
          }
          break;
        case constants.validatorDecorators.ArrayMinSize.name:
          schema.properties[propertyName].minItems = decorator.arguments[0];
          break;
        case constants.validatorDecorators.ArrayMaxSize.name:
          schema.properties[propertyName].maxItems = decorator.arguments[0];
          break;
      }
    }
  }
}
