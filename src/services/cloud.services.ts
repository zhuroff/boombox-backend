import { CloudApi } from '../types/cloud.types'
import { CloudEntityDTO } from '../dto/cloud.dto'
import { getCloudApi } from '..'
import { CloudReqPayload, CloudReqPayloadFilter } from '../types/reqres.types'
import utils from '../utils'

export default {
  async getImages({ path, cloudURL, limit, offset, root }: Required<CloudReqPayloadFilter>) {
    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const content = await cloudApi.getFolderContent(
      `${satitizedPath}&limit=${limit}&offset=${offset}`,
      root
    )
    
    if (content) {
      const finalContent = {
        ...content,
        items: await Promise.allSettled(
          utils.fileFilter(content.items, utils.imagesMimeTypes)
            .map(async (item) => await this.getImageWithURL(item, cloudApi, root))
        ) as PromiseFulfilledResult<Required<CloudEntityDTO>>[]
      }

      return {
        ...finalContent,
        items: finalContent.items.map(({ value }) => value)}
    }

    throw new Error('Files not found')
  },
  
  async getFile({ path, cloudURL, type, root }: CloudReqPayloadFilter) {
    if (!path || !cloudURL || !type) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const file = await cloudApi.getFile(satitizedPath, type, root)
    
    if (file) {
      return file
    }

    throw new Error('File not found')
  },

  async getTrackDuration({ path, cloudURL }: CloudReqPayload) {
    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    return cloudApi.getFile(path, 'file')
  },

  async getImageWithURL(item: Required<CloudEntityDTO>, cloudApi: CloudApi, root?: string) {
    const fetchedFile = await cloudApi.getFile(item.path, 'image', root)
    return { ...item, url: fetchedFile }
  },

  async getFolderContent({ path, cloudURL, root, limit, offset }: CloudReqPayloadFilter) {
    if ([path, cloudURL].some((prop) => typeof prop === 'undefined')) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const content = await cloudApi.getFolderContent(
      `${satitizedPath}&limit=${limit || 500}&offset=${offset || 0}`,
      root
    )

    if (content) {
      return content
    }

    throw new Error('Content not found')
  },

  async getRandomTracks({ path, cloudURL, root, limit, years }: CloudReqPayloadFilter & { years: string[] }): Promise<any> {
    const response = years.map(async (year) => (
      await this.getFolderContent({ path, cloudURL, root: `${root}/${year}` })
    ))

    const content = await Promise.all(response)

    const allTracks =  content.reduce<CloudEntityDTO[]>((acc, next) => {
      acc.push(...next.items.filter((item) => item.mimeType && utils.audioMimeTypes.has(item.mimeType)))
      return acc
    }, [])

    if (!limit || allTracks.length <= limit) {
      return utils.shuffleArray(allTracks)
    }

    let overLimit = allTracks.length - limit

    while (overLimit) {
      const randomIndex = Math.floor(Math.random() * allTracks.length)
      allTracks.splice(randomIndex, 1)
      overLimit--
    }

    return utils.shuffleArray(allTracks)
  },

  async getRandomAlbums({
    path, cloudURL, root, limit, criteria, exclude, value
  }: CloudReqPayloadFilter & { criteria: string; exclude: string; value: string }): Promise<any> {
    switch(criteria) {
      case 'genre':
        return await this.getRandomAlbumsByGenre({ path, cloudURL, root, limit, value, exclude })
      case 'year':
        return await this.getRandomAlbumsByYear({ path, cloudURL, root, limit, value, exclude })
      default:
        throw new Error('Unknown criteria')
    }
  },

  async getRandomAlbumsByGenre({
    path, cloudURL, root, limit = 5, exclude, value
  }: CloudReqPayloadFilter & { value: string; exclude: string }) {
    if (!root) throw new Error('Root property is required')

    const response = await this.getFolderContent({ path, cloudURL, root: encodeURIComponent(`${root}/${value}`), offset: 0 })
    const filteredItems = utils.shuffleArray(response.items.filter(({ title, mimeType }) => (
      !mimeType && !title.startsWith('-') && title !== exclude
    )))

    while (filteredItems.length > Math.abs(limit)) {
      const randomIndex = Math.floor(Math.random() * filteredItems.length)
      filteredItems.splice(randomIndex, 1)
    }

    return await Promise.all(filteredItems.map(async (folder) => ({
      title: `TOY: ${value}`,
      artist: { title: 'Various Artists' },
      genre: { title: value },
      period: { title: folder.title },
      coverURL: await this.getFile({
        path: `${value}/${folder.title}/cover.webp`,
        type: 'image',
        cloudURL,
        root
      })
    })))
  },

  async getRandomAlbumsByYear({
    path, cloudURL, root, exclude, limit = 5, value
  }: CloudReqPayloadFilter & { value: string; exclude: string }) {
    if (!root) throw new Error('Root property is required')

    const genres = await this.getFolderContent({ path, cloudURL, root, offset: 0 })
    const filteredGenres = utils.shuffleArray(genres.items.filter(({ title, mimeType }) => (
      !mimeType && title !== exclude
    )))

    const albums = await Promise.all(filteredGenres.map(async (genre) => {
      try {
        return {
          title: `TOY: ${genre.title}`,
          artist: { title: 'Various Artists' },
          genre: { title: genre.title },
          period: { title: value },
          coverURL: await this.getFile({
            path: `${genre.title}/${value}/cover.webp`,
            type: 'image',
            cloudURL,
            root
          })
        }
      } catch (error) {
        return null
      }
    }))
    
    const filteredAlbums = albums.filter((album) => album)

    while (filteredAlbums.length > Math.abs(limit)) {
      const randomIndex = Math.floor(Math.random() * filteredAlbums.length)
      filteredAlbums.splice(randomIndex, 1)
    }

    return filteredAlbums
  }
}
