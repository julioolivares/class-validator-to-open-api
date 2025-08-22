import { transform } from '../src/transformer.js'
import { UserEntity } from './entities/user.entity.js'
import { Role } from './entities/role.entity.js'

// Test classes without decorators
class PlainUser {
  id: number
  name: string
  email: string
  age: number
  isActive: boolean
  tags: string[]
  createdAt: Date
  profile: UserProfile
}

class UserProfile {
  bio: string
  avatar: string
}

console.log('Testing class with decorators:')
const userWithDecorators = transform(UserEntity)
console.log(JSON.stringify(userWithDecorators, null, 2))

console.log('\nTesting class without decorators:')
try {
  const plainUserResult = transform(PlainUser)
  console.log('Success! Generated schema for plain class:')
  console.log(JSON.stringify(plainUserResult, null, 2))
} catch (error) {
  console.error(
    'Error:',
    error instanceof Error ? error.message : String(error)
  )
}

console.log('\nTesting nested class without decorators:')
try {
  const profileResult = transform(UserProfile)
  console.log('Success! Generated schema for nested class:')
  console.log(JSON.stringify(profileResult, null, 2))
} catch (error) {
  console.error(
    'Error:',
    error instanceof Error ? error.message : String(error)
  )
}
