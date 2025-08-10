import type { Length } from "class-validator";
import path, { format } from "path";

const messages = {
  errors: {
    tsconfigNotFound: (path: string) => `tsconfig.json not found at ${path}`,
    emitDecoratorNotSet: `emitDecoratorMetadata option is not configure as true on tsconfig.json`,
    experimentalDecoratorsNotSet:
      "experimentalDecorators option is no set as true on tsconfig.json",
    compilerOptionsNotFound: 'compilerOptions not found on tsconfig.json'  
  },
};

const TS_CONFIG_DEFAULT_PATH = path.resolve(process.cwd(), "tsconfig.json");

const jsPrimitives = {
  String: { type: "String", value: "string" },
  Number: { type: "Number", value: "number" },
  Boolean: { type: "Boolean", value: "boolean" },
  Symbol: { type: "Symbol", value: "symbol" },
  BigInt: { type: "BigInt", value: "integer" },
  null: { type: "null", value: "null" },
  Object: { type: "Object", value: "object" },
  Array: { type: "Array", value: "array" },
  Date: { type: "Date", value: "date" },
  Function: { type: "Function", value: "function" },
  Buffer: { type: 'Buffer', value: 'string', format: 'binary' }, 
  Uint8Array: {type: 'Uint8Array', value: 'string', format: 'binary'  }, 
  UploadFile: {type: 'UploadFile', value: 'string', format: 'binary'  }
};

const validatorDecorators = {
  Length: { name: "length", type: "string" },
  MinLength: { name: "minLength", type: "string" },
  MaxLength: { name: "maxLength", type: "string" },
  IsInt: { name: "isInt", type: "integer", format: "int32" },
  IsNumber: { name: "isNumber", type: "number", format: "double" },
  IsString: { name: "isString", type: "string", format: "string" },
  IsPositive: { name: "isPositive", type: "number" },
  IsDate: { name: "isDate", type: "date", format: "date" },
  IsEmail: { name: "isEmail", type: "string", format: "email" },
  IsNotEmpty: { name: "isNotEmpty" },
  IsBoolean: { name: "isBoolean", type: "boolean" },
  Min: { name: "min" },
  Max: { name: "max" },
  ArrayNotEmpty: { name: "arrayNotEmpty" },
  ArrayMaxSize: { name: "arrayMaxSize" },
  ArrayMinSize: { name: "arrayMinSize" },
};

const constants = {
  TS_CONFIG_DEFAULT_PATH,
  jsPrimitives,
  validatorDecorators,
};

export { messages, constants };
