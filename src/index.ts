import ts from "typescript";
import "reflect-metadata";
import { getMetadataStorage, type MetadataStorage } from "class-validator";

import { messages, constants } from "./fixtures.js";
import type { ValidationMetadata } from "class-validator/types/metadata/ValidationMetadata.js";
import { type SchemaType, type Property } from "./types.js";

/**
 * Transforms class-validator decorated classes into OpenAPI schema objects.
 * Analyzes TypeScript classes with validation decorators and generates corresponding JSON schemas.
 */
export class SchemaTransformer {
  private tsconfigPath: string;
  private storage: MetadataStorage;

  /**
   * Creates a new SchemaTransformer instance.
   * @param tsConfigPath - Path to the TypeScript configuration file
   * @public
   */
  constructor(tsConfigPath: string = constants.TS_CONFIG_DEFAULT_PATH) {
    this.tsconfigPath = tsConfigPath;
    this.storage = getMetadataStorage();

    this.isSupportMetadata();
  }

  /**
   * Validates TypeScript configuration for decorator metadata support.
   * @returns True if configuration supports metadata
   * @throws Error if configuration is invalid or missing required options
   * @private
   */
  private isSupportMetadata(): boolean {
    try {
      const { config, error } = ts.readConfigFile(
        this.tsconfigPath,
        ts.sys.readFile
      );

      if (error) {
        throw new Error(error.messageText.toString());
      }

      if (!config.compilerOptions) {
        throw new Error(messages.errors.compilerOptionsNotFound);
      }

      if (!config.compilerOptions.emitDecoratorMetadata) {
        throw new Error(messages.errors.emitDecoratorNoSet);
      }

      if (!config.compilerOptions.experimentalDecorators) {
        throw new Error(messages.errors.experimentalDecoratorsNoSet);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a JSON schema from class validation metadata.
   * @param cls - The class constructor function to analyze
   * @returns JSON schema object with properties and validation rules
   * @private
   */
  private getSchema(cls: Function) {
    const metadata = this.storage.groupByPropertyName(
      this.storage.getTargetValidationMetadatas(
        cls,
        cls.name,
        false,
        false,
        undefined
      )
    );

    let schema: SchemaType = { properties: {}, required: [], type: "object" };

    for (const property in metadata) {
      this.parseValidation({
        cls,
        propertyName: property,
        schema,
        validations: metadata[property] as ValidationMetadata[],
      });
    }

    return schema;
  }

  /**
   * Parses validation metadata for a specific property and updates the schema.
   * @param params - Object containing class, property name, validations, and schema
   * @param params.cls - The class constructor function
   * @param params.propertyName - Name of the property being processed
   * @param params.validations - Array of validation metadata for the property
   * @param params.schema - The schema object to update
   * @returns Updated schema object
   * @private
   */
  private parseValidation({
    cls,
    propertyName,
    validations,
    schema,
  }: {
    schema: SchemaType;
    propertyName: string;
    cls: Function;
    validations: ValidationMetadata[];
  }) {
    let { type, format, propertySchema } = this.getPrimitiveType(cls, propertyName);

    if(Object.keys(propertySchema.properties).length) {
      schema.properties[propertyName] = {...propertySchema, type };
    }
    else {
      schema.properties[propertyName] = { type, format };
    }

    return this.parseToSchemaValidation({
      cls,
      validations,
      propertyName: propertyName,
      schema,
    });
  }

  /**
   * Determines the primitive type and format for a class property.
   * @param cls - The class constructor function
   * @param propertyName - Name of the property to analyze
   * @returns Object containing type, format, and nested property schema
   * @private
   */
  private getPrimitiveType(cls: Function, propertyName: string) {
    let propertyType = Reflect.getMetadata(
      "design:type",
      cls.prototype,
      propertyName
    );

    let format;
    let type: string 
    let propertySchema: SchemaType = { properties: {}, required: [], type: "object" };

    switch (propertyType.name) {
      case constants.jsPrimitives.String.type:
        type = constants.jsPrimitives.String.value;
        break;
      case constants.jsPrimitives.Number.type:
        type = constants.jsPrimitives.Number.value;
        break;
      case constants.jsPrimitives.Boolean.type:
        type = constants.jsPrimitives.Boolean.value;
        break;
      case constants.jsPrimitives.Date.type:
        type = constants.jsPrimitives.Date.value;
        break;
      case constants.jsPrimitives.Object.type:
        type = constants.jsPrimitives.Object.value;
        break;
      case constants.jsPrimitives.Array.type:
        type = constants.jsPrimitives.Array.value;
        break;
      case constants.jsPrimitives.Uint8Array.type:
      case constants.jsPrimitives.Buffer.type:
      case constants.jsPrimitives.UploadFile.type:
        type = constants.jsPrimitives.Buffer.value;
        format = constants.jsPrimitives.Buffer.format;
        break;

      default:
        propertySchema = this.transform(propertyType).schema
        type = constants.jsPrimitives.Object.value;
        break;
    }

    return { type, format, propertySchema };
  }

  /**
   * Processes array properties and applies validation rules to array items.
   * @param params - Object containing class, property name, schema, and validations
   * @param params.cls - The class constructor function
   * @param params.propertyName - Name of the array property
   * @param params.schema - The schema object to update
   * @param params.validations - Array of validation metadata
   * @private
   */
  private parsePrimitiveArray({
    cls,
    propertyName,
    schema,
    validations,
  }: {
    cls: Function;
    propertyName: string;
    schema: SchemaType;
    validations: ValidationMetadata[];
  }) {
    let propertyType = Reflect.getMetadata(
      "design:type",
      cls.prototype,
      propertyName
    );

    schema.properties[propertyName].items = {
      type: (propertyType.name as string).toLocaleLowerCase(),
    };

    if (propertyType.name === constants.jsPrimitives.Function.value) {
      // Todo llamar recursivo para otro clase usando a this.transform
    } else {
      validations.forEach((validation) => {
        const decoratorName = validation.name;

        switch (decoratorName) {
          case constants.validatorDecorators.IsString.name:
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsString.format;
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsString.type;
            break;

          case constants.validatorDecorators.IsInt.name:
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsInt.format;
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsInt.type;
            break;

          case constants.validatorDecorators.IsNumber.name:
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsNumber.format;
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsNumber.type;
            break;

          case constants.validatorDecorators.IsEmail.name:
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsEmail.format;
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsEmail.type;
            break;

          case constants.validatorDecorators.IsDate.name:
            schema.properties[propertyName].items.format =
              constants.validatorDecorators.IsDate.format;
            schema.properties[propertyName].items.type =
              constants.validatorDecorators.IsDate.type;

            break;
        }
      });

      if (!schema.properties[propertyName].items.format) {
        schema.properties[propertyName].items.format =
          constants.jsPrimitives.String.value;
      }
    }
  }

  /**
   * Applies validation rules to schema properties based on their type.
   * @param params - Object containing validations, property name, schema, and class
   * @param params.validations - Array of validation metadata
   * @param params.propertyName - Name of the property being validated
   * @param params.schema - The schema object to update
   * @param params.cls - The class constructor function
   * @returns Updated schema object
   * @private
   */
  private parseToSchemaValidation({
    validations,
    propertyName,
    schema,
    cls,
  }: {
    validations: ValidationMetadata[];
    propertyName: string;
    schema: SchemaType;
    cls: Function;
  }) {


    if (
      schema.properties[propertyName].type ===
      constants.jsPrimitives.Array.value
    ) {
      this.parsePrimitiveArray({ cls, propertyName, schema, validations });
    } else {
      this.addValidationSchema(validations, schema, propertyName);
    }

    schema.required = Array.from(new Set(schema.required || []));

    return schema;
  }

  /**
   * Maps class-validator decorators to JSON schema validation properties.
   * @param validations - Array of validation metadata from class-validator
   * @param schema - The schema object to update
   * @param propertyName - Name of the property being validated
   * @private
   */
  private addValidationSchema(
    validations: ValidationMetadata[],
    schema: SchemaType,
    propertyName: string
  ) {
    validations.forEach((validation) => {
      const decoratorName = validation.name;

      switch (decoratorName) {
        case constants.validatorDecorators.Length.name:
          schema.properties[propertyName].minLength = validation.constraints[0];
          if (validation.constraints[1])
            schema.properties[propertyName].maxLength =
              validation.constraints[1];
          break;

        case constants.validatorDecorators.MinLength.name:
          schema.properties[propertyName].minLength = validation.constraints[0];
          break;

        case constants.validatorDecorators.MaxLength.name:
          schema.properties[propertyName].maxLength = validation.constraints[0];
          break;

        case constants.validatorDecorators.IsInt.name:
          schema.properties[propertyName].format =
            constants.validatorDecorators.IsInt.format;
          schema.properties[propertyName].type =
            constants.validatorDecorators.IsInt.type;
          break;

        case constants.validatorDecorators.IsEmail.name:
          schema.properties[propertyName].format =
            constants.validatorDecorators.IsEmail.format;
          break;

        case constants.validatorDecorators.IsPositive.name:
          schema.properties[propertyName].minimum = 0;
          break;

        case constants.validatorDecorators.IsDate.name:
          schema.properties[propertyName].format =
            constants.validatorDecorators.IsDate.format;
          break;

        case constants.validatorDecorators.IsNotEmpty.name:
          schema.required.push(propertyName);
          break;

        case constants.validatorDecorators.IsBoolean.name:
          schema.properties[propertyName].type =
            constants.validatorDecorators.IsBoolean.type;
          break;

        case constants.validatorDecorators.Min.name:
          schema.properties[propertyName].minimum = validation.constraints[0];
          break;

        case constants.validatorDecorators.Max.name:
          schema.properties[propertyName].maximum = validation.constraints[0];
          break;

        case constants.validatorDecorators.ArrayNotEmpty.name:
          schema.properties[propertyName].minItems = 1;
          schema.required.push(propertyName);
          break;

        case constants.validatorDecorators.ArrayMinSize.name:
          schema.properties[propertyName].minItems = validation.constraints[0];
          break;
        case constants.validatorDecorators.ArrayMaxSize.name:
          schema.properties[propertyName].maxItems = validation.constraints[0];
          break;
      }
    });
  }

  /**
   * Transforms a class with validation decorators into an OpenAPI schema object.
   * @param cls - The class constructor function to transform
   * @returns Object containing the class name and its corresponding JSON schema
   * @example
   * ```typescript
   * class User {
   *   @IsString()
   *   @IsNotEmpty()
   *   name: string;
   * 
   *   @IsEmail()
   *   email: string;
   * }
   * 
   * const transformer = new SchemaTransformer();
   * const result = transformer.transform(User);
   * 
   * // Result:
   * // {
   * //   name: "User",
   * //   schema: {
   * //     type: "object",
   * //     properties: {
   * //       name: { type: "string" },
   * //       email: { type: "string", format: "email" }
   * //     },
   * //     required: ["name"]
   * //   }
   * // }
   * ```
   * @public
   */
  public transform(cls: Function): { [key: string]: any } {
    const schema = this.getSchema(cls);

    return { name: cls.name, schema };
  }
}
