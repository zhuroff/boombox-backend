import { PaginateOptions, PipelineStage, Types } from 'mongoose'
import { Compilation, CompilationDocument, CompilationDocumentTrack } from '../models/compilation.model'
import { CompilationRepository, GatheringUpdatePayload, NewCompilationPayload } from '../types/gathering'
import { ListRequestConfig } from '../types/pagination'

export default class CompilationRepositoryContract implements CompilationRepository {
  async getRawCompilations() {
    return await Compilation.find({}, { title: true })
  }

  async getRawCompilation(id: Types.ObjectId | string) {
    return await Compilation.findById(id).exec()
  }

  async createCompilation(payload: NewCompilationPayload) {
    const newCompilation = new Compilation(payload)
    await newCompilation.save()

    const compilations = await this.getPaginatedCompilations({
      limit: 15,
      sort: { title: 1 },
      page: 1
    })

    return {
      id: newCompilation._id,
      compilations
    }
  }

  async updateCompilation({ entityID, gatheringID, isInList, order }: GatheringUpdatePayload) {
    const query = { _id: gatheringID }
    const update = isInList
      ? { $pull: { tracks: { track: entityID } } }
      : { $push: { tracks: { track: entityID, order } } }
    const options = { new: true }

    await Compilation.findOneAndUpdate(query, update, options)

    return await this.getPaginatedCompilations({
      limit: 15,
      sort: { title: 1 },
      page: 1
    })
  }

  async removeCompilation(id: string) {
    return await Compilation.findByIdAndDelete(id)
  }

  async updateCompilationOrder(_id: Types.ObjectId | string, tracks: CompilationDocumentTrack[]) {
    await Compilation.updateOne({ _id }, { $set: { tracks } })
  }

  async getPaginatedCompilations(body: ListRequestConfig) {
    const options: PaginateOptions = {
      page: body.page,
      limit: body.limit,
      sort: body.sort,
      lean: true,
      select: {
        title: true,
        avatar: true,
        tracks: true
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
            path: 'inAlbum',
            select: ['title', 'cloudURL'],
            options: { lean: true }
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
