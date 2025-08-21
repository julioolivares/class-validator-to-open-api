import { transform } from '.'

class BaseDto<Dto> {
  public x: Dto
}

class UploadFileDto {}

class FileTest {
  avatar: BaseDto<UploadFileDto>
  files: Buffer[]
}

const result = transform(FileTest)

console.log(JSON.stringify(result, null, 2))
