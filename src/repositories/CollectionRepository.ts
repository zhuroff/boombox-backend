import { Request } from 'express'
import { PaginateOptions, Types } from 'mongoose'
import { Collection, CollectionDocumentAlbum } from '../models/collection.model'
import { CollectionRepository, GatheringUpdatePayload, NewCollectionPayload } from '../types/gathering.types'

export default class CollectionRepositoryContract implements CollectionRepository {
  async getRawCollections() {
    return await Collection.find({}, { title: true })
  }

  async getPaginatedCollections(req: Request) {
    const options: PaginateOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      lean: true,
      select: {
        title: true,
        avatar: true
      }
    }

    return await Collection.paginate({}, options)
  }

  async getRawCollection(id: Types.ObjectId | string) {
    return await Collection.findById(id)
  }

  async getPopulatedCollection(id: string) {
    return await Collection.findById(id)
      .populate({
        path: 'albums.album',
        select: ['title', 'artist', 'genre', 'period', 'albumCover', 'folderName', 'cloudURL'],
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'genre', select: ['title'] },
          { path: 'period', select: ['title'] },
          { path: 'inCollections', select: ['title'] }
        ]
      })
      .lean()
  }

  async createCollection(payload: NewCollectionPayload) {
    const newCollection = new Collection(payload)
    return await newCollection.save()
  }

  async updateCollection({ entityID, gatheringID, isInList, order }: GatheringUpdatePayload) {
    const query = { _id: gatheringID }
    const update = isInList
      ? { $pull: { albums: { album: entityID } } }
      : { $push: { albums: { album: entityID, order } } }
    const options = { new: true }

    await Collection.findOneAndUpdate(query, update, options)
  }

  async updateCollectionOrder(_id: Types.ObjectId | string, albums: CollectionDocumentAlbum[]) {
    await Collection.updateOne({ _id }, { $set: { albums } })
  }

  async removeCollection(id: Types.ObjectId | string) {
    return await Collection.findByIdAndDelete(id)
  }

  async cleanCollection(collectionIds: Types.ObjectId[], albumId: Types.ObjectId | string) {
    return await Collection.updateMany(
      { _id: { $in: collectionIds } },
      { $pull: { albums: { album: albumId } } }
    )
  }
}