import { CloudApi } from '../types/cloud.types'
import { CloudReqPayload, CloudReqPayloadFilter } from '../types/reqres.types'
import { CloudEntityDTO } from '../types/cloud.types'
import { getCloudApi } from '..'
import utils from '../utils'

// Переделать так, чтобы эти методы могли работать с другими облаками.
// Возможно, вынести toy в отдельную апишку
class CloudService {
  private async getRandomAlbumsByGenre({
    id, path, cloudURL, cluster, limit = 5, exclude, value
  }: CloudReqPayloadFilter & { value: string; exclude: string }) {
    if (!cluster) {
      throw new Error('"Cluster" property is required for TOY queries')
    }

    try {
      const response = await this.getFolderContent({
        id,
        path,
        cloudURL,
        cluster: encodeURIComponent(`${cluster}/${value}`), 
        offset: 0
      })

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
          id: folder.id,
          path: `${value}/${folder.title}/cover.webp`,
          type: 'image',
          cloudURL,
          cluster
        })
      })))
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  private async getRandomAlbumsByYear({
    id, path, cloudURL, cluster, exclude, limit = 5, value
  }: CloudReqPayloadFilter & { value: string; exclude: string }) {
    if (!cluster) {
      throw new Error('Cluster property is required for TOY queries')
    }

    try {
      const genres = await this.getFolderContent({
        id,
        path,
        cloudURL,
        cluster,
        offset: 0
      })

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
              id: genre.id,
              path: `${genre.title}/${value}/cover.webp`,
              type: 'image',
              cloudURL,
              cluster
            })
          }
        } catch (error) {
          console.error(error)
          return null
        }
      }))
      
      const filteredAlbums = albums.filter((album) => album)

      while (filteredAlbums.length > Math.abs(limit)) {
        const randomIndex = Math.floor(Math.random() * filteredAlbums.length)
        filteredAlbums.splice(randomIndex, 1)
      }

      return filteredAlbums
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  public async getImages({
    id, type, path, cloudURL, limit, offset, cluster
  }: Required<CloudReqPayloadFilter>) {
    if (!cluster) {
      throw new Error('Cluster property is required for TOY queries')
    }

    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    try {
      const content = await cloudApi.getFolderContent({
        id,
        cluster,
        fileType: type,
        path: `${satitizedPath}&limit=${limit}&offset=${offset}`
      })
      
      if (content) {
        const finalContent = {
          ...content,
          items: await Promise.allSettled(
            utils.fileFilter(content.items, utils.imagesMimeTypes)
              .map(async (item) => await this.getImageWithURL(item, cloudApi, cluster))
          ) as PromiseFulfilledResult<Required<CloudEntityDTO>>[]
        }
  
        return {
          ...finalContent,
          items: finalContent.items.map(({ value }) => value)}
      }
  
      throw new Error('Files not found')
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  public async getFile({
    id, path, cloudURL, type, cluster
  }: CloudReqPayloadFilter) {
    if (!cluster) {
      throw new Error('Cluster property is required for TOY queries')
    }

    if (!path || !cloudURL || !type) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    try {
      const file = await cloudApi.getFile({
        id,
        cluster,
        fileType: type,
        path: satitizedPath
      })
    
      if (file) {
        return file
      }

      throw new Error('File not found')
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  public async getTrackDuration({ id, path, cloudURL }: CloudReqPayload) {
    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    
    try {
      return await cloudApi.getFile({
        id,
        path,
        fileType: 'file'
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  public async getImageWithURL(item: Required<CloudEntityDTO>, cloudApi: CloudApi, cluster?: string) {
    try {
      const fetchedFile = await cloudApi.getFile({
        id: item.id,
        path: item.path,
        fileType: 'image',
        cluster
      })
      return { ...item, url: fetchedFile }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  public async getFolderContent({
    id, path, cloudURL, cluster, limit, offset
  }: CloudReqPayloadFilter) {
    if ([path, cloudURL].some((prop) => typeof prop === 'undefined')) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    try {
      const content = await cloudApi.getFolderContent({
        id,
        cluster,
        fileType: 'file',
        path: `${satitizedPath}&limit=${limit || 500}&offset=${offset || 0}`
      })
  
      if (content) {
        return content
      }
  
      throw new Error('Content not found')
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  public async getRandomTracks({
    id, path, cloudURL, cluster, limit, years
  }: CloudReqPayloadFilter & { years: string[] }): Promise<any> {
    if (!cluster) {
      throw new Error('Cluster property is required for TOY queries')
    }

    try {
      const response = years.map(async (year) => (
        await this.getFolderContent({
          id,
          path,
          cloudURL,
          cluster: `${cluster}/${year}`
        })
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
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  public async getRandomAlbums({
    id, path, cloudURL, cluster, limit, criteria, exclude, value
  }: CloudReqPayloadFilter & { criteria: string; exclude: string; value: string }): Promise<any> {
    if (!cluster) {
      
    }

    try {
      switch(criteria) {
        case 'genre':
          return await this.getRandomAlbumsByGenre({
            id,
            path,
            cloudURL,
            cluster,
            limit,
            value,
            exclude
          })
        case 'year':
          return await this.getRandomAlbumsByYear({
            id,
            path,
            cloudURL,
            cluster,
            limit,
            value,
            exclude
          })
        default:
          throw new Error('Unknown criteria')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default new CloudService()
