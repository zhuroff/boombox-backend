import { Request } from 'express'
import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import { NewCollectionPayload, CollectionRepository, GatheringCreatePayload, GatheringReorder, GatheringUpdatePayload, GatheringItem } from '../types/gathering'
import { AlbumRepository } from '../types/album'
import { ListRequestConfig } from '../types/pagination'
import AlbumViewFactory from '../views/AlbumViewFactory'
import GatheringViewFactory from '../views/GatheringViewFactory'
import PaginationViewFactory from '../views/PaginationViewFactory'
import Parser from '../utils/Parser'

export default class CollectionService {
  constructor(
    private collectionRepository: CollectionRepository,
    private albumRepository: AlbumRepository
  ) {}

  async createCollection({ title, entityID }: GatheringCreatePayload) {
    const rawCollections = await this.collectionRepository.getRawCollections()

    if (rawCollections.some((col) => col.title === title)) {
      throw new Error('collections.exists')
    }

    const payload: NewCollectionPayload = {
      title,
      albums: [
        {
          album: new Types.ObjectId(entityID),
          order: 1
        }
      ]
    }

    const {
      id,
      collections: { totalDocs, totalPages, page, docs }
    } = await this.collectionRepository.createCollection(payload)

    this.albumRepository.updateCollectionsInAlbum({
      listID: id.toString(),
      itemID: entityID,
      inList: false
    })

    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })

    return {
      pagination,
      docs: docs.reduce<GatheringItem[]>((acc, next) => {
        if (!!next) {
          acc.push(GatheringViewFactory.createGatheringItemView(next, next.albums))
        }
        return acc
      }, [])
    }
  }

  async getCollections(req: Request) {
    const parsedQuery = Parser.parseNestedQuery<ListRequestConfig>(req)
    const dbList = await this.collectionRepository.getPaginatedCollections(parsedQuery)

    if (!dbList) {
      throw new Error('Incorrect request options')
    }

    const { totalDocs, totalPages, page, docs } = dbList
    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })

    return {
      pagination,
      docs: docs.reduce<GatheringItem[]>((acc, next) => {
        if (!!next) {
          acc.push(GatheringViewFactory.createGatheringItemView(next, next.albums))
        }
        return acc
      }, [])
    }
  }

  async getCollection(id: string) {
    const collection = await this.collectionRepository.getPopulatedCollection(id)

    if (!collection) {
      throw new Error('Incorrect request options or collection not found')
    }

    const coveredAlbums = await Promise.all(collection.albums.map(async ({ album, order }) => {
      const item = album as AlbumDocument
      const cover = await this.albumRepository.fetchAlbumCover(item)
      return { album: item, cover, order }
    }))

    return GatheringViewFactory.createCollectionPageView(
      collection,
      coveredAlbums.map(({ album, cover, order }) => (
        AlbumViewFactory.createAlbumItemView(album, cover, order)
      ))
    )
  }

  async updateCollection({ entityID, gatheringID, isInList, order }: GatheringUpdatePayload) {
    const updatedCollections = await this.collectionRepository.updateCollection({
      entityID,
      gatheringID,
      isInList,
      order
    })

    await this.albumRepository.updateCollectionsInAlbum({
      listID: gatheringID,
      itemID: entityID,
      inList: isInList
    })

    const { totalDocs, totalPages, page, docs } = updatedCollections
    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })

    return {
      pagination,
      docs: docs.reduce<GatheringItem[]>((acc, next) => {
        if (!!next) {
          acc.push(GatheringViewFactory.createGatheringItemView(next, next.albums))
        }
        return acc
      }, [])
    }
  }

  async removeCollection(id: Types.ObjectId | string) {
    const response = await this.collectionRepository.removeCollection(id)

    if (!response) {
      throw new Error('Incorrect request options')
    }

    await this.albumRepository.cleanAlbumCollections(response.albums, id)
    return { message: 'collections.drop' }
  }

  async cleanCollection(collectionIds: Types.ObjectId[], albumId: Types.ObjectId | string) {
    return await this.collectionRepository.cleanCollection(collectionIds, albumId)
  }

  async reorderCollections({ oldOrder, newOrder }: GatheringReorder, id: string | Types.ObjectId) {
    const targetCollection = await this.collectionRepository.getRawCollection(id)

    if (!targetCollection) {
      throw new Error('Incorrect request options')
    }

    targetCollection.albums.splice(
      newOrder, 0,
      ...targetCollection.albums.splice(oldOrder, 1)
    )

    targetCollection.albums.forEach((el, index) => {
      el.order = index + 1
    })

    await this.collectionRepository.updateCollectionOrder(id, targetCollection.albums)
    return { message: 'collections.reordered' }
  }
}