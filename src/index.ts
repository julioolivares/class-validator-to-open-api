import ts from "typescript";
import "reflect-metadata";
import { getMetadataStorage, type MetadataStorage } from "class-validator";

import { messages, constants } from "./fixtures.js";
import type { ValidationMetadata } from "class-validator/types/metadata/ValidationMetadata.js";
import { type SchemaType, type Property } from "./types.js";

export class SchemaTransformer {
  tsconfigPath: string;
  storage: MetadataStorage;

  constructor(tsConfigPath: string = constants.TS_CONFIG_DEFAULT_PATH) {
    this.tsconfigPath = tsConfigPath;
    this.storage = getMetadataStorage();

    this.isSupportMetadata();
  }

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
        throw new Error("compilerOptions not found on tsconfig.json");
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

  public transform(cls: Function): { [key: string]: any } {
    const schema = this.getSchema(cls);

    return { name: cls.name, schema };
  }

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
        name: property,
        schema,
        validation: metadata[property] as ValidationMetadata[],
      });
    }

    return schema;
  }

  private parseValidation({
    cls,
    name,
    validation,
    schema,
  }: {
    schema: SchemaType;
    name: string;
    cls: Function;
    validation: ValidationMetadata[];
  }) {
    let type = this.getPrimitiveType(cls, name);

    schema.properties[name] = { type };

    return this.parseToSchemaValidation({
      validation,
      propertyName: name,
      schema,
    });
  }

  private getPrimitiveType(cls: Function, name: string) {
    let type = Reflect.getMetadata("design:type", cls.prototype, name).name;

    switch (type) {
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
      default:
        type = constants.jsPrimitives.String.value;
        break;
    }

    return type;
  }

  private parseToSchemaValidation({
    validation,
    propertyName,
    schema,
  }: {
    validation: ValidationMetadata[];
    propertyName: string;
    schema: SchemaType;
  }) {
    const initialType = schema.properties[propertyName].type;

    let newType = initialType;

    validation.forEach((validation) => {
      const decoratorName = validation.name;

      switch (decoratorName) {
        case constants.validatorDecorators.IsString.name:
          newType = constants.jsPrimitives.String.value;
          break;

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
          newType = "integer";
          schema.properties[propertyName].format = "int32";
          break;

        case constants.validatorDecorators.IsEmail.name:
          newType = "string";
          schema.properties[propertyName].format = "email";
          break;

        case constants.validatorDecorators.IsPositive.name:
          newType = constants.jsPrimitives.Number.value;
          break;

        case constants.validatorDecorators.IsDate.name:
          newType = constants.jsPrimitives.Date.value;
          break;

        case constants.validatorDecorators.IsEmail.name:
          newType = constants.jsPrimitives.String.value;
          break;

        case constants.validatorDecorators.IsNotEmpty.name:
          schema.required.push(propertyName);
          break;

        case constants.validatorDecorators.IsOptional.name:
          newType = constants.jsPrimitives.String.value;
          break;

        case constants.validatorDecorators.IsBoolean.name:
          newType = constants.jsPrimitives.Boolean.value;
          break;

        case constants.validatorDecorators.IsNumber.name:
          newType = constants.jsPrimitives.Number.value;
          break;

        case constants.validatorDecorators.Min.name:
          newType = constants.jsPrimitives.Number.value;
          break;

        case constants.validatorDecorators.Max.name:
          newType = constants.jsPrimitives.Number.value;
          break;

        case constants.validatorDecorators.ArrayNotEmpty.name:
          schema.required.push(propertyName);
          break;
        case constants.validatorDecorators.ArrayMinSize.name:
          schema.properties[propertyName].minItems = validation.constraints[0];
          break;
        case constants.validatorDecorators.ArrayMaxSize.name:
          schema.properties[propertyName].maxItems = validation.constraints[0];
          break;

        default:
          newType = constants.jsPrimitives.String.value;
          break;
      }
    });

    schema.required = Array.from(new Set(schema.required));

    return schema;
  }
}
