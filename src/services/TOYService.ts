import { Request } from 'express'
import { getCloudApi } from '..'
import { TOYRepository } from '../types/toy'
import { ListRequestConfig } from '../types/pagination'
import TOYView from '../views/TOYView'
import TrackViewFactory from '../views/TrackViewFactory'
// import { CloudEntity, CloudReqPayloadFilter } from '../types/cloud.types'
// import FileFilter from '../utils/FileFilter'
import Parser from '../utils/Parser'

export default class TOYService {
  #root = 'MelodyMap/TOY'
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

    if (!genre || !year) {
      throw new Error('Genre and year are required')
    }

    const path = encodeURIComponent(`${this.#root}/${genre}/${year}`)
    const { result, metadataContent, coverURL } = await this.toyRepository.getTOYAlbum(path)
    const tracks = result.items
      .filter((item) => item.mimeType?.startsWith('audio'))
      .map((item, index) => TrackViewFactory.create(
        {
          ...item,
          path: encodeURIComponent(`/${this.#root}/${genre}/${year}/${item.path}`),
        },
        {
          order: ++index,
          period: { title: year },
          genre: { title: genre },
          inAlbum: { title: `TOY: ${genre}` },
          artist: { title: Parser.parseTrackArtistName(item.title) }
        }
      ))

    return new TOYView(genre, year, tracks, coverURL, metadataContent)
  }

  async getTOYRandomAlbum() {
    const genres = await this.toyRepository.getTOYList(this.#root)
    const years = await Promise.all(genres.map(async (genre) => {
      const years = await this.toyRepository.getTOYList(`${this.#root}/${encodeURIComponent(genre.title)}`)
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

    if (!album['genre'] || !album['year']) {
      throw new Error('Genre and year are required')
    }

    const path = encodeURIComponent(`${this.#root}/${album['genre']}/${album['year']}`)
    const { result, coverURL, metadataContent } = await this.toyRepository.getTOYAlbum(path)
    const tracks = result.items
      .filter((item) => item.mimeType?.startsWith('audio'))
      .map((item, index) => TrackViewFactory.create(
        {
          ...item,
          path: encodeURIComponent(`/${this.#root}/${album['genre']}/${album['year']}/${item.path}`),
        },
        {
          order: ++index,
          period: { title: album['year'] || 'N/A' },
          genre: { title: album['genre'] || 'N/A' },
          inAlbum: { title: `TOY: ${album['genre']}` },
          artist: { title: Parser.parseTrackArtistName(item.title) }
        }
      ))

    return new TOYView(album['genre'], album['year'], tracks, coverURL, metadataContent)
  }

  async getTOYRandomAlbums(parsedQuery: ListRequestConfig) {
    const cloudApi = getCloudApi(String(process.env['TOY_CLOUD_URL']))
    const results = await this.toyRepository.getTOYListRandom(parsedQuery)
    const shuffledResults = this.#shuffleArray(results)

    while (shuffledResults.length > Math.abs(parsedQuery.limit || 5)) {
      const randomIndex = Math.floor(Math.random() * shuffledResults.length)
      shuffledResults.splice(randomIndex, 1)
    }

    const docs = await Promise.all(shuffledResults.map(async (album) => {
      const coverURL = await cloudApi.getFile({
        path: `${album.path}/cover.webp`,
        fileType: 'image'
      })

      return new TOYView(album.genre, album.period, [], coverURL)
    }))

    return { docs }
  }

  async getTOYContent(req: Request) {
    return await this.toyRepository.getTOYContent(this.#root, req)
  }

  async getTOYWave(req: Request) {
    const parsedQuery = Parser.parseNestedQuery<ListRequestConfig>(req)
    const tracks = await this.toyRepository.getTOYWave(this.#root, parsedQuery)
    let shuffledTracks = []

    if (!parsedQuery['limit'] || tracks.length <= parsedQuery['limit']) {
      shuffledTracks = this.#shuffleArray(tracks)
    } else {
      let overLimit = tracks.length - parsedQuery['limit']
      while (overLimit) {
        const randomIndex = Math.floor(Math.random() * tracks.length)
        tracks.splice(randomIndex, 1)
        overLimit--
      }
      shuffledTracks = this.#shuffleArray(tracks)
    }

    return shuffledTracks.map((track) => TrackViewFactory.create(track.track, track.metadata))
  }
}
