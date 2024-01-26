import { Request } from 'express'
import { Types, PaginateOptions, PipelineStage } from 'mongoose'
import { CompilationItemDTO, CompilationPageDTO } from '../dto/compilation.dto'
import { PaginationDTO } from '../dto/pagination.dto'
import { TrackDTO } from '../dto/track.dto'
import { TrackDocument } from '../models/track.model'
import { Compilation, CompilationDocument } from '../models/compilation.model'
import { GatheringCreatePayload, GatheringUpdatePayload, GatheringReorder } from '../types/common.types'
import { RequestFilter } from '../types/reqres.types'
import tracksServices from './tracks.services'

export default {
  async create({ title, entityID }: GatheringCreatePayload) {
    const compilations = await Compilation.find({}, { title: true })
    
    if (compilations.some((col) => col.title === title)) {
      throw new Error('compilations.exists')
    }

    const payload = {
      title,
      tracks: [
        {
          track: new Types.ObjectId(entityID),
          order: 1
        }
      ]
    }

    const newCompilation = new Compilation(payload)
    await newCompilation.save()
    await tracksServices.updateCompilationInTrack({
      listID: newCompilation._id.toString(),
      itemID: entityID,
      inList: false
    })

    return new CompilationItemDTO(newCompilation)
  },
  async update({ entityID, gatheringID, isInList, order }: GatheringUpdatePayload) {
    const query = { _id: gatheringID }
    const update = isInList
      ? { $pull: { tracks: { track: entityID } } }
      : { $push: { tracks: { track: entityID, order } } }
    const options = { new: true }

    await Compilation.findOneAndUpdate(query, update, options)
    await tracksServices.updateCompilationInTrack({ listID: gatheringID, itemID: entityID, inList: isInList })

    return { message: isInList ? 'compilations.removed' : 'compilations.added' }
  },
  async remove(id: string) {
    const response = await Compilation.findByIdAndDelete(id)

    if (response) {
      await tracksServices.reduceTracksCompilations(response.tracks, id)
      return { message: 'compilations.drop' }
    }

    throw new Error('Incorrect request options')
  },
  async reorder({ oldOrder, newOrder }: GatheringReorder, _id: string) {
    const targetCompilation = await Compilation.findById(_id).exec()

    if (targetCompilation) {
      targetCompilation.tracks.splice(
        newOrder, 0,
        ...targetCompilation.tracks.splice(oldOrder, 1)
      )

      targetCompilation.tracks.forEach((el, index) => {
        el.order = index + 1
      })

      await Compilation.updateOne({ _id }, { $set: { tracks: targetCompilation.tracks } })
      return { message: 'compilations.reordered' }
    }

    throw new Error('Incorrect request options')
  },
  async getCompilationsList(req: Request) {
    if (req.body.isRandom) {
      return await this.getListRandom(req.body.limit, req.body.filter)
    }

    const options: PaginateOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      lean: true,
      populate: [
        { path: 'tracks', select: ['_id'] }
      ],
      select: {
        title: true,
        avatar: true
      }
    }

    const dbList = await Compilation.paginate({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })
      const docs = dbList.docs.map((compilation) => new CompilationItemDTO(compilation))

      return { docs, pagination }
    }

    throw new Error('Incorrect request options')
  },
  async single(id: string | Types.ObjectId) {
    const singleCompilation: CompilationDocument = await Compilation.findById(id)
      .populate({
        path: 'tracks.track',
        select: ['title', 'listened', 'duration', 'path', 'cloudURL'],
        populate: [
          {
            path: 'artist',
            select: ['title']
          },
          {
            path: 'inAlbum',
            select: ['title', 'cloudURL', 'period'],
            options: { lean: true },
            populate: [
              { path: 'period', select: ['title'] }
            ]
          }
        ]
      })
      .lean()

      return new CompilationPageDTO(
        singleCompilation,
        singleCompilation.tracks.map(({ track }) => {
          const trackDoc = track as TrackDocument
          return new TrackDTO(trackDoc, trackDoc.inAlbum.period)
        })
      )
  },
  async cleanCompilation(compilations: Map<string, string[]>) {
    return await Promise.all(Array.from(compilations).map(async ([compilationId, trackIds]) => (
      await Compilation.updateMany(
        { _id: compilationId },
        { $pull: { tracks: { track: { $in: trackIds } } } }
      )
    )))
  },
  async rename(_id: string, title: string) {
    const query = { _id }
    const update = { title }

    await Compilation.findOneAndUpdate(query, update)

    return { message: 'Compilation title was successfully updated' }
  },
  async getListRandom(size: number, filter: RequestFilter) {
    const basicConfig: PipelineStage[] = [
      { $sample: { size } },
      { $match: { _id: { $ne: new Types.ObjectId(filter.excluded?.['_id']) } } }
    ]

    const response = await Compilation.aggregate<CompilationDocument>(basicConfig)

    if (response) {
      return { docs: response }
    }

    throw new Error('Incorrect request options')
  }
}
