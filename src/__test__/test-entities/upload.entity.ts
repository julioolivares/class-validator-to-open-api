import { IsNotEmpty, IsArray } from 'class-validator'

class UploadFile {}

export class DocumentUpload {
  @IsNotEmpty()
  document: UploadFile

  @IsArray()
  attachments: UploadFile[]

  avatar: UploadFile
}
