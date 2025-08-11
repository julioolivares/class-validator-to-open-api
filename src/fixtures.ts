import path from 'path'

const messages = {
  errors: {
    tsconfigNotFound: (path: string) => `tsconfig.json not found at ${path}`,
    classNotFound: (className: string) =>
      `Class ${className} not found in source files`,
    fileNotFound: (filePath: string) => `File ${filePath} not found`,
  },
}

const TS_CONFIG_DEFAULT_PATH = path.resolve(process.cwd(), 'tsconfig.json')

const jsPrimitives = {
  String: { type: 'String', value: 'string' },
  Number: { type: 'Number', value: 'number' },
  Boolean: { type: 'Boolean', value: 'boolean' },
  Symbol: { type: 'Symbol', value: 'symbol' },
  BigInt: { type: 'BigInt', value: 'integer' },
  null: { type: 'null', value: 'null' },
  Object: { type: 'Object', value: 'object' },
  Array: { type: 'Array', value: 'array' },
  Date: { type: 'Date', value: 'string', format: 'date-time' },
  Function: { type: 'Function', value: 'function' },
  Buffer: { type: 'Buffer', value: 'string', format: 'binary' },
  Uint8Array: { type: 'Uint8Array', value: 'string', format: 'binary' },
  UploadFile: { type: 'UploadFile', value: 'string', format: 'binary' },
}

const validatorDecorators = {
  Length: { name: 'Length', type: 'string' },
  MinLength: { name: 'MinLength', type: 'string' },
  MaxLength: { name: 'MaxLength', type: 'string' },
  IsInt: { name: 'IsInt', type: 'integer', format: 'int32' },
  IsNumber: { name: 'IsNumber', type: 'number', format: 'double' },
  IsString: { name: 'IsString', type: 'string', format: 'string' },
  IsPositive: { name: 'IsPositive', type: 'number' },
  IsDate: { name: 'IsDate', type: 'string', format: 'date-time' },
  IsEmail: { name: 'IsEmail', type: 'string', format: 'email' },
  IsNotEmpty: { name: 'IsNotEmpty' },
  IsBoolean: { name: 'IsBoolean', type: 'boolean' },
  IsArray: { name: 'IsArray', type: 'array' },
  Min: { name: 'Min' },
  Max: { name: 'Max' },
  ArrayNotEmpty: { name: 'ArrayNotEmpty' },
  ArrayMaxSize: { name: 'ArrayMaxSize' },
  ArrayMinSize: { name: 'ArrayMinSize' },
}

const constants = {
  TS_CONFIG_DEFAULT_PATH,
  jsPrimitives,
  validatorDecorators,
}

export { messages, constants }
