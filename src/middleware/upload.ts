import { Request, Response, NextFunction } from 'express'
import path from 'path'
import multer, { FileFilterCallback, MulterError } from 'multer'

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
    callback(new Error('only_webp_allowed'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
})

export const handleMulterError = (err: unknown, _: Request, res: Response, next: NextFunction): void => {
  if (err instanceof MulterError) {
    let message
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'file_size_exceeded_5mb'
        break
      case 'LIMIT_FILE_COUNT':
        message = 'file_count_exceeded'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'unexpected_file_field'
        break
      default:
        message = err.message || 'file_upload_error'
    }
    
    res.status(422).json({ error: message })
    return
  }
  
  if (err && typeof err === 'object' && 'message' in err) {
    res.status(422).json({ error: err.message })
    return
  }
  
  next(err)
}

export default upload
