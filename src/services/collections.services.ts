import { Request } from 'express'
import { PaginateOptions, Types } from 'mongoose'
import { Collection, CollectionDocument } from '../models/collection.model'
import { Album, AlbumDocument } from '../models/album.model'
// import { Period } from '../models/period.model'
// import { Artist } from '../models/artist.model'
// import { Genre } from '../models/genre.model'
import { PaginationDTO } from '../dto/pagination.dto'
import { CollectionItemDTO, CollectionPageDTO } from '../dto/collection.dto'
import { CompilationCreatePayload, CompilationUpdatePayload } from '../types/common.types'
import albumsServices from './albums.services'
import { AlbumItemDTO } from '../dto/album.dto'
import { CollectionReorder } from '../types/collection.types'

class CollectionsServices {
  async create({ title, entityID }: CompilationCreatePayload) {
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

    return {
      id: newCollection._id.toString(),
      title: title,
      albums: [entityID]
    }
  }

  async remove(_id: string) {
    // const response = await Collection.findByIdAndDelete(_id)

    // if (response) {
    //   await this.cleanAlbums(response.albums, _id)
    //   return { message: 'Collection successfully removed' }
    // }

    // throw new Error('Incorrect request options')
  }

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
  }

  async single(id: string) {
    const singleCollection: CollectionDocument = await Collection.findById(id)
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
      
    const coveredAlbums: AlbumItemDTO[] = await albumsServices.getCoveredAlbums(
      (singleCollection.albums || []).map(({ album }) => album as AlbumDocument)
    )

    return new CollectionPageDTO(singleCollection, coveredAlbums)
  }

  async update({ entityID, gatheringID, isInList, order }: CompilationUpdatePayload) {
    const query = { _id: gatheringID }
    const update = isInList
      ? { $pull: { albums: { album: entityID } } }
      : { $push: { albums: { album: entityID, order } } }
    const options = { new: true }

    await Collection.findOneAndUpdate(query, update, options)
    await this.updateAlbum({ listID: gatheringID, itemID: entityID, inList: isInList })

    return { message: isInList ? 'collections.removed' : 'collections.added' }
  }

  async cleanCollection(collectionIds: Types.ObjectId[], albumId: Types.ObjectId | string) {
    return await Collection.updateMany(
      { _id: { $in: collectionIds } },
      { $pull: { albums: { album: albumId } } }
    )
  }

  async reorder({ oldOrder, newOrder }: CollectionReorder, _id: string) {
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
  }

  async updateAlbum({ listID, itemID, inList }: Partial<any /* CollectionUpdateProps */>) {
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
  }

  async cleanAlbums(albums: /* CollectionModelAlbum*/ any[], listID: string) {
    const cleanProcess = albums.map(async (album) => {
      const query = { _id: album.album }
      const update = { $pull: { inCollections: listID } }
      const options = { new: true }

      return await Album.findOneAndUpdate(query, update, options)
    })

    return await Promise.all(cleanProcess)
  }
}

export default new CollectionsServices()
