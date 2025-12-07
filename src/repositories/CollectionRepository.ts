import { PaginateOptions, Types } from 'mongoose'
import { Collection, CollectionDocumentAlbum } from '../models/collection.model'
import { CollectionPostPayload, CollectionRepository, GatheringUpdatePayload, NewCollectionPayload } from '../types/gathering'
import { ListRequestConfig } from '../types/pagination'

export default class CollectionRepositoryContract implements CollectionRepository {
  async getRawCollections() {
    return await Collection.find({}, { title: true })
  }

  async getPaginatedCollections(body: ListRequestConfig) {
    const options: PaginateOptions = {
      page: body.page,
      limit: body.limit,
      sort: body.sort,
      lean: true,
      select: {
        title: true,
        avatar: true,
        albums: true
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
        select: [
          'title',
          'artist',
          'genre',
          'period',
          'albumCover',
          'folderName',
          'cloudURL',
          'path'
        ],
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'genre', select: ['title'] },
          { path: 'period', select: ['title'] },
          { path: 'inCollections', select: ['title'] }
        ]
      })
      .populate({
        path: 'albums.post'
      })
      .lean()
  }

  async createCollection(payload: NewCollectionPayload) {
    const newCollection = new Collection(payload)
    await newCollection.save()

    const collections = await this.getPaginatedCollections({
      limit: 15,
      sort: { title: 1 },
      page: 1
    })

    return {
      id: newCollection._id,
      collections
    }
  }

  async updateCollection({
    entityID,
    gatheringID,
    isInList,
    order
  }: GatheringUpdatePayload) {
    const query = { _id: gatheringID }
    const update = isInList
      ? { $pull: { albums: { album: entityID } } }
      : { $push: { albums: { album: entityID, order } } }
    const options = { new: true }

    await Collection.findOneAndUpdate(query, update, options)

    return await this.getPaginatedCollections({
      limit: 15,
      sort: { title: 1 },
      page: 1
    })
  }

  async updatePost(_id: string, { albumId, post }: CollectionPostPayload) {
    const query = { _id }
    const update = { $set: { 'albums.$[elem].post': post } }
    const options = { 
      new: true,
      arrayFilters: [{ 'elem.album': albumId }]
    }

    return await Collection.findOneAndUpdate(query, update, options)
  }

  async updateTitle(id: string, payload: { title: string }) {
    return await Collection.findByIdAndUpdate(
      id,
      { $set: { title: payload.title } },
      { new: true }
    )
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