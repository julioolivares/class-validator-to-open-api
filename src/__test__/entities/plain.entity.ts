// Entity without class-validator decorators
export class PlainUser {
  id: number
  name: string
  email: string
  age: number
  isActive: boolean
  tags: string[]
  createdAt: Date
  profile: UserProfile
}

export class UserProfile {
  bio: string
  avatar: string
  socialMedia: SocialMedia
}

export class SocialMedia {
  twitter: string
  github: string
}
