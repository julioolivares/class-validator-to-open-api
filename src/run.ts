import { transform } from './transformer'

// Original test classes
class BaseDto<Dto> {
  public x: Dto
}

class UploadFileDto {}

class FileTest {
  avatar: BaseDto<UploadFileDto>
  files: Buffer[]
}

// New test classes without decorators
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

console.log('Testing original class:')
const result = transform(FileTest)
console.log(JSON.stringify(result, null, 2))

console.log('\n--- NEW FUNCTIONALITY ---')
console.log('Testing class WITHOUT decorators:')
try {
  const plainUserResult = transform(PlainUser)
  console.log('✅ Success! Generated schema for plain class:')
  console.log(JSON.stringify(plainUserResult, null, 2))
} catch (error) {
  console.error(
    '❌ Error:',
    error instanceof Error ? error.message : String(error)
  )
}

console.log('\nTesting nested class WITHOUT decorators:')
try {
  const profileResult = transform(UserProfile)
  console.log('✅ Success! Generated schema for nested class:')
  console.log(JSON.stringify(profileResult, null, 2))
} catch (error) {
  console.error(
    '❌ Error:',
    error instanceof Error ? error.message : String(error)
  )
}
