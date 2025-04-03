import { Request } from 'express'
import path from 'path'
import multer, { FileFilterCallback } from 'multer'

type MulterCallback = {
  (error: Error | null, destination: string): void
}

const filenameSlugify = (filename: string) => {
  return filename.toLowerCase().replace(/ /g, '-')
}

const storage = multer.diskStorage({
  destination (_: Request, __: Express.Multer.File, callback: MulterCallback) {
    callback(null, path.resolve(__dirname, '../../', 'uploads'))
  },

  filename (_: Request, file: Express.Multer.File, callback: MulterCallback) {
    callback(null, `${new Date().getTime()}-${filenameSlugify(file.originalname)}`)
  }
})

const fileFilter = (_: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (file.mimetype === 'image/webp') {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

export default multer({
  storage,
  fileFilter,
  limits: {fileSize: 1024 * 1024 * 5 }
})
