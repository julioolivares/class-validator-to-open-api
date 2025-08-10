import { UserEntity } from './entities/user.entity.js'
import { SchemaTransformer } from '../src/index.js'

const transformer = new SchemaTransformer()

const schema = transformer.transform(UserEntity)

console.log(JSON.stringify(schema, null, 2))
