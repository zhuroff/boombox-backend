import { TOYRepository } from '../types/toy.types'
import { CloudEntity, CloudReqPayloadFilter } from '../types/cloud.types'
import utils from '../utils'

export default class TOYService {
  constructor(private toyRepository: TOYRepository) {}

  async getCloudFile(filter: CloudReqPayloadFilter) {
    return await this.toyRepository.getCloudFile(filter)
  }

  async getCloudContent(filter: CloudReqPayloadFilter) {
    return await this.toyRepository.getFolderContent(filter)
  }

  async getCloudImages(filter: Required<CloudReqPayloadFilter>) {
    const { id, type, path, cloudURL, offset, cluster } = filter

    if (!cluster) {
      throw new Error('Cluster property is required for TOY queries')
    }

    if (![path, type, cloudURL].some(Boolean)) {
      throw new Error('Incorrect request options: "path", "type" and "cloudURL" are required')
    }

    const response = await this.toyRepository.getFolderContent({
      id,
      path,
      cloudURL,
      cluster,
      offset
    })

    if (!response) {
      throw new Error('Files not found')
    }

    const finalContent = {
      ...response,
      items: await Promise.allSettled(
        utils.fileFilter(response.items, utils.imagesMimeTypes)
          .map(async (item) => await this.toyRepository.getImageWithURL(item, cluster))
      ) as PromiseFulfilledResult<Required<CloudEntity>>[]
    }

    return {
      ...finalContent,
      items: finalContent.items.map(({ value }) => value)
    }
  }

  async getTrackDuration(filter: CloudReqPayloadFilter) {
    return await this.toyRepository.getCloudFile(filter)
  }

  async getRandomAlbums(filter: CloudReqPayloadFilter) {
    const { id, type, path, cloudURL, cluster, limit = 5, exclude, value } = filter
    
    if (!cluster) {
      throw new Error('"Cluster" property is required for TOY queries')
    }

    if (![path, type, cloudURL].some(Boolean)) {
      throw new Error('Incorrect request options: "path", "type" and "cloudURL" are required')
    }

    const response = await this.toyRepository.getFolderContent({
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
      coverURL: await this.toyRepository.getCloudFile({
        id: folder.id,
        path: `${value}/${folder.title}/cover.webp`,
        type: 'image',
        cloudURL,
        cluster
      })
    })))
  }

  async getRandomTracks(filter: CloudReqPayloadFilter & { years: string[] }) {
    const { id, path, cloudURL, cluster, limit = 5, years } = filter

    if (!cluster) {
      throw new Error('Cluster property is required for TOY queries')
    }

    const response = years.map(async (year) => (
      await this.toyRepository.getFolderContent({
        id,
        path,
        cloudURL,
        cluster: `${cluster}/${year}`
      })
    ))

    const content = await Promise.all(response)

    const allTracks =  content.reduce<CloudEntity[]>((acc, next) => {
      acc.push(...next.items.filter((item) => (
        item.mimeType && utils.audioMimeTypes.has(item.mimeType)
      )))

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
  }
}
