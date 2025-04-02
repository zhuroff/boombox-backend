import { Request } from 'express'
import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import { CollectionRepository, GatheringCreatePayload, GatheringReorder, GatheringUpdatePayload } from '../types/common.types'
import { NewCollectionPayload } from '../types/reqres.types'
import { AlbumRepository } from '../types/album.types'
import { CollectionItemDTO, CollectionPageDTO } from '../dto/collection.dto'
import AlbumViewFactory from '../views/AlbumViewFactory'
import PaginationViewFactory from '../views/PaginationViewFactory'

export default class CollectionService {
  constructor(
    private collectionRepository: CollectionRepository,
    private albumRepository: AlbumRepository
  ) {}

  async createCollection({ title, entityID }: GatheringCreatePayload) {
    const collections = await this.collectionRepository.getRawCollections()

    if (collections.some((col) => col.title === title)) {
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

    const newCollection = await this.collectionRepository.createCollection(payload)
    this.albumRepository.updateCollectionsInAlbum({
      listID: newCollection._id.toString(),
      itemID: entityID,
      inList: false
    })

    return new CollectionItemDTO(newCollection)
  }

  async getCollections(req: Request, isTitlesOnly = false) {
    const collections = await this.collectionRepository.getPaginatedCollections(req)

    if (!collections.docs?.every((col) => !!col)) {
      throw new Error('Incorrect request options')
    }

    if (isTitlesOnly) {
      return collections.docs.map(({ title }) => title)
    }

    const { totalDocs, totalPages, page } = collections
    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })
    const docs = collections.docs.map((collection) => new CollectionItemDTO(collection))

    return { docs, pagination }
  }

  async getCollection(id: string) {
    const collection = await this.collectionRepository.getPopulatedCollection(id)

    if (!collection) {
      throw new Error('Incorrect request options or collection not found')
    }

    const coveredAlbums = await this.albumRepository.getCoveredAlbums(
      collection.albums.map(({ album }) => album as AlbumDocument)
    )

    return new CollectionPageDTO(
      collection,
      coveredAlbums.map(({ album }) => AlbumViewFactory.createAlbumItemView(album))
    )
  }

  async updateCollection({ entityID, gatheringID, isInList, order }: GatheringUpdatePayload) {
    await this.collectionRepository.updateCollection({
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

    return { message: isInList ? 'collections.removed' : 'collections.added' }
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