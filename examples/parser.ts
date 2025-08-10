import 'reflect-metadata'
import { getMetadataStorage } from 'class-validator'

import { UserEntity  } from './entities/user.entity.js'

import { SchemaTransformer } from '../src/index.js'

const transformer = new SchemaTransformer()

const schema = transformer.transform(UserEntity)

console.log(schema)

/* 
const storage = getMetadataStorage()

const metadata = storage.groupByPropertyName( storage.getTargetValidationMetadatas(
    UserEntity,
    UserEntity.name,
    false,
    false,
    undefined
))

console.log(metadata)

console.log(Reflect.getMetadata('design:type', UserEntity.prototype, 'role'))

const jsPrimitives = {
    String: 'string',
    Number: 'number',
    Boolean: 'boolean',
    Symbol: 'symbol',
    BigInt: 'integer',
    null: 'null',
    Object: 'object',
    Array: 'array',
    Date: 'date'
}

console.log(jsPrimitives) */