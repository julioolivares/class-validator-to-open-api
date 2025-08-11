import { UserEntity } from './entities/user.entity.js'
import { transform } from '../src/index.js'

// Using the transform function
const schema = transform(UserEntity)

console.log(JSON.stringify(schema, null, 2))
