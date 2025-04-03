import { Request } from 'express'
import { PaginateOptions, PipelineStage, Types } from 'mongoose'
import { Compilation, CompilationDocument, CompilationDocumentTrack } from '../models/compilation.model'
import { CompilationRepository, GatheringUpdatePayload, NewCompilationPayload } from '../types/gathering.types'
import { ListRequestConfig } from '../types/pagination.types'

export default class CompilationRepositoryContract implements CompilationRepository {
  async getRawCompilations() {
    return await Compilation.find({}, { title: true })
  }

  async getRawCompilation(id: Types.ObjectId | string) {
    return await Compilation.findById(id).exec()
  }

  async createCompilation(payload: NewCompilationPayload) {
    const newCompilation = new Compilation(payload)
    return await newCompilation.save()
  }

  async updateCompilation({ entityID, gatheringID, isInList, order }: GatheringUpdatePayload) {
    const query = { _id: gatheringID }
    const update = isInList
      ? { $pull: { tracks: { track: entityID } } }
      : { $push: { tracks: { track: entityID, order } } }
    const options = { new: true }

    await Compilation.findOneAndUpdate(query, update, options)
  }

  async removeCompilation(id: string) {
    return await Compilation.findByIdAndDelete(id)
  }

  async updateCompilationOrder(_id: Types.ObjectId | string, tracks: CompilationDocumentTrack[]) {
    await Compilation.updateOne({ _id }, { $set: { tracks } })
  }

  async getPaginatedCompilations(req: Request) {
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

    return await Compilation.paginate({}, options)
  }

  async getPopulatedCompilation(id: string | Types.ObjectId) {
    return await Compilation.findById(id)
      .populate({
        path: 'tracks.track',
        select: ['title', 'listened', 'duration', 'path', 'cloudURL'],
        populate: [
          {
            path: 'artist',
            select: ['title']
          },
          {
            path: 'genre',
            select: ['title']
          },
          {
            path: 'period',
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
  }

  async cleanCompilation(compilations: Map<string, string[]>) {
    await Promise.all(Array.from(compilations).map(async ([compilationId, trackIds]) => (
      await Compilation.updateMany(
        { _id: compilationId },
        { $pull: { tracks: { track: { $in: trackIds } } } }
      )
    )))
  }

  async renameCompilation(query: { _id: string }, update: { title: string }) {
    await Compilation.findOneAndUpdate(query, update)
  }

  async getRandomCompilations(size: number, filter: NonNullable<ListRequestConfig['filter']>) {
    const queryConfig: PipelineStage[] = [
      { $sample: { size } },
      { $match: { _id: { $ne: new Types.ObjectId(filter.excluded?.['_id']) } } }
    ]

    return await Compilation.aggregate<CompilationDocument>(queryConfig)
  }
}
