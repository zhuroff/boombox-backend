import { CloudEntity } from '../types/cloud'

export default class FileFilter {
  static readonly typesMap = {
    audioMimeTypes: new Set([
      'audio/aac',
      'audio/x-aac',
      'audio/aiff',
      'audio/x-aiff',
      'audio/flac',
      'audio/x-flac',
      'audio/mp3',
      'audio/x-mp3',
      'audio/mpeg3',
      'audio/x-mpeg-3',
      'audio/x-mpegurl',
      'audio/mp4',
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
      'audio/x-wav',
      'audio/webm',
      'audio/x-ms-wma',
      'application/octet-stream'
    ]),
    imagesMimeTypes: new Set([
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp',
      'application/octet-stream'
    ])
  }

  static fileFilter(data: CloudEntity[], typesKey: keyof typeof this.typesMap): Required<CloudEntity>[] {
    const mimeTypeSet = this.typesMap[typesKey]
    return data.reduce<Required<CloudEntity>[]>((acc, next) => {
      if (next.mimeType && mimeTypeSet.has(next.mimeType)) {
        acc.push(next as Required<CloudEntity>)
      }
      return acc
    }, [])
  }
}
