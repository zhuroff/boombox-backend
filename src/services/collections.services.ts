import { Request } from 'express'
import { FilterQuery, PaginateOptions, Types } from 'mongoose'
import { GatheringCreatePayload, GatheringUpdatePayload, GatheringUpdateProps, GatheringReorder } from '../types/common.types'
import { Collection, CollectionDocument, CollectionDocumentAlbum } from '../models/collection.model'
import { CollectionItemDTO, CollectionPageDTO } from '../dto/collection.dto'
import { Album, AlbumDocument } from '../models/album.model'
import { AlbumItemDTO } from '../dto/album.dto'
import { PaginationDTO } from '../dto/pagination.dto'
import albumsServices from './albums.services'

export default {
  async create({ title, entityID }: GatheringCreatePayload) {
    const collections = await Collection.find({}, { title: true })

    if (collections.some((col) => col.title === title)) {
      throw new Error('collections.exists')
    }

    const payload = {
      title,
      albums: [
        {
          album: new Types.ObjectId(entityID),
          order: 1
        }
      ]
    }

    const newCollection = new Collection(payload)
    await newCollection.save()
    await this.updateAlbum({
      listID: newCollection._id.toString(),
      itemID: entityID,
      inList: false
    })

    return new CollectionItemDTO(newCollection)
  },
  async update({ entityID, gatheringID, isInList, order }: GatheringUpdatePayload) {
    const query = { _id: gatheringID }
    const update = isInList
      ? { $pull: { albums: { album: entityID } } }
      : { $push: { albums: { album: entityID, order } } }
    const options = { new: true }

    await Collection.findOneAndUpdate(query, update, options)
    await this.updateAlbum({ listID: gatheringID, itemID: entityID, inList: isInList })

    return { message: isInList ? 'collections.removed' : 'collections.added' }
  },
  async remove(id: string) {
    const response = await Collection.findByIdAndDelete(id)

    if (response) {
      await this.cleanAlbums(response.albums, id)
      return { message: 'collections.drop' }
    }

    throw new Error('Incorrect request options')
  },
  async reorder({ oldOrder, newOrder }: GatheringReorder, _id: string) {
    const targetCollection = await Collection.findById(_id).exec()

    if (targetCollection) {
      targetCollection.albums.splice(
        newOrder, 0,
        ...targetCollection.albums.splice(oldOrder, 1)
      )

      targetCollection.albums.forEach((el, index) => {
        el.order = index + 1
      })

      await Collection.updateOne({ _id }, { $set: { albums: targetCollection.albums } })
      return { message: 'collections.reordered' }
    }

    throw new Error('Incorrect request options')
  },
  async getCollectionsList(req: Request, isOnlyTitles = false) {
    const options: PaginateOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      lean: true,
      populate: [
        { path: 'albums', select: ['_id'] }
      ],
      select: {
        title: true,
        avatar: true
      }
    }

    const dbList = await Collection.paginate({}, options)

    if (dbList) {
      if (isOnlyTitles) return dbList.docs.map(({ title }) => title)
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })
      const docs = dbList.docs.map((collection) => new CollectionItemDTO(collection))

      return { docs, pagination }
    }

    throw new Error('Incorrect request options')
  },
  async single(id: string) {
    const singleCollection: CollectionDocument | null = await Collection.findById(id)
      .populate({
        path: 'albums.album',
        select: ['title', 'artist', 'genre', 'period', 'albumCover', 'folderName', 'cloudURL'],
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'genre', select: ['title'] },
          { path: 'period', select: ['title'] }
        ]
      })
      .lean()

    if (!singleCollection) {
      throw new Error('Incorrect request options or collection not found')
    }
      
    const coveredAlbums: AlbumItemDTO[] = await albumsServices.getCoveredAlbums(
      (singleCollection.albums || []).map(({ album }) => album as AlbumDocument)
    )

    return new CollectionPageDTO(singleCollection, coveredAlbums)
  },
  async cleanCollection(collectionIds: Types.ObjectId[], albumId: Types.ObjectId | string) {
    return await Collection.updateMany(
      { _id: { $in: collectionIds } },
      { $pull: { albums: { album: albumId } } }
    )
  },
  async updateAlbum({ listID, itemID, inList }: GatheringUpdateProps) {
    try {
      const query = { _id: itemID }
      const update = inList
        ? { $pull: { inCollections: listID } }
        : { $push: { inCollections: listID } }
      const options = { new: true }

      await Album.findOneAndUpdate(query, update, options)
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  async cleanAlbums(albums: CollectionDocumentAlbum[], listID: string) {
    const cleanProcess = albums.map(async (album) => {
      const query: FilterQuery<AlbumDocument> = { _id: new Types.ObjectId(album.album.toString()) }
      const update = { $pull: { inCollections: listID } }
      const options = { new: true }

      return await Album.findOneAndUpdate(query, update, options)
    })

    return await Promise.all(cleanProcess)
  }
}
