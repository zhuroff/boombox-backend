import { Request } from 'express'
import { getCloudApi } from '..'
import { TOYRepository } from '../types/toy.types'
import { ListRequestConfig } from '../types/pagination.types'
import TrackViewFactory from '../views/TrackViewFactory'
// import { CloudEntity, CloudReqPayloadFilter } from '../types/cloud.types'
// import FileFilter from '../utils/FileFilter'
import Parser from '../utils/Parser'

export default class TOYService {
  #toyRoot = 'MelodyMap/TOY'
  #shuffleArray<T>(array: T[]) {
    let length = array.length
    let index: number
    let temp: T
  
    while (length) {
      index = Math.floor(Math.random() * length--)
      temp = array[length]!
      array[length] = array[index]!
      array[index] = temp
    }
  
    return array
  }

  constructor(private toyRepository: TOYRepository) {}

  async getTOYList(req: Request) {
    const parsedQuery = Parser.parseNestedQuery<ListRequestConfig>(req)
    const { path, isRandom } = req.query

    if (!isRandom && path) {
      const folders = await this.toyRepository.getTOYList(String(path))
      return ({
        docs: folders.filter((folder) => !folder.title.startsWith('-'))
      })
    }

    if (isRandom) {
      return await this.getTOYRandomAlbums(parsedQuery)
    }

    throw new Error('Incorrect request options: "path" or "isRandom" are required')
  }

  async getTOYAlbum(req: Request) {
    const { genre, year } = req.params

    if (genre === 'random') {
      return await this.getTOYRandomAlbum()
    }

    const path = encodeURIComponent(`${this.#toyRoot}/${genre}/${year}`)
    const { result, metadataContent, coverURL } = await this.toyRepository.getTOYAlbum(path)
    
    return {
      coverURL,
      metadataContent,
      title: `TOY: ${genre}, ${year}`,
      artist: { title: 'Various Artists' },
      genre: { title: genre },
      period: { title: year },
      tracks: result.items
        .filter((item) => item.mimeType?.startsWith('audio'))
        .map((item) => TrackViewFactory.create(item))
    }
  }

  async getTOYRandomAlbum() {
    const genres = await this.toyRepository.getTOYList(this.#toyRoot)
    const years = await Promise.all(genres.map(async (genre) => {
      const years = await this.toyRepository.getTOYList(`${this.#toyRoot}/${encodeURIComponent(genre.title)}`)
      return years.reduce<Record<string, string>[]>((acc, next) => {
        if (!next.title.startsWith('-')) {
          acc.push({
            genre: genre.title,
            year: next.title
          })
        }
        return acc
      }, [])
    }))

    const results = years.flat()
    const randomIndex = Math.floor(Math.random() * results.length)
    const album = results[randomIndex]

    if (!album) {
      throw new Error('No album found')
    }

    const path = encodeURIComponent(`${this.#toyRoot}/${album['genre']}/${album['year']}`)
    const { result, coverURL, metadataContent } = await this.toyRepository.getTOYAlbum(path)

    return {
      coverURL,
      metadataContent,
      title: `TOY: ${album['genre']}, ${album['year']}`,
      artist: { title: 'Various Artists' },
      genre: { title: album['genre'] },
      period: { title: album['year'] },
      tracks: result.items
        .filter((item) => item.mimeType?.startsWith('audio'))
        .map((item) => TrackViewFactory.create(item))
    }
  }

  async getTOYRandomAlbums(parsedQuery: ListRequestConfig) {
    const cloudApi = getCloudApi(String(process.env['TOY_CLOUD_URL']))
    const results = await this.toyRepository.getTOYListRandom(parsedQuery)
    const shuffledResults = this.#shuffleArray(results)

    while (shuffledResults.length > Math.abs(parsedQuery.limit || 5)) {
      const randomIndex = Math.floor(Math.random() * shuffledResults.length)
      shuffledResults.splice(randomIndex, 1)
    }

    const docs = await Promise.all(shuffledResults.map(async (album) => ({
      ...album,
      coverURL: await cloudApi.getFile({
        path: `${album.path}/cover.webp`,
        fileType: 'image'
      })
    })))

    return { docs }
  }

  // async getRandomTracks(filter: CloudReqPayloadFilter & { years: string[] }) {
  //   const { id, path, cloudURL, limit = 5, years } = filter

  //   const response = years.map(async (year) => (
  //     await this.toyRepository.getFolderContent({
  //       id,
  //       path,
  //       cloudURL
  //     })
  //   ))

  //   const content = await Promise.all(response)

  //   const allTracks =  content.reduce<CloudEntity[]>((acc, next) => {
  //     acc.push(...next.items.filter((item) => (
  //       item.mimeType && FileFilter.typesMap.audioMimeTypes.has(item.mimeType)
  //     )))

  //     return acc
  //   }, [])

  //   if (!limit || allTracks.length <= limit) {
  //     return this.#shuffleArray(allTracks)
  //   }

  //   let overLimit = allTracks.length - limit

  //   while (overLimit) {
  //     const randomIndex = Math.floor(Math.random() * allTracks.length)
  //     allTracks.splice(randomIndex, 1)
  //     overLimit--
  //   }

  //   return this.#shuffleArray(allTracks)
  // }
}
