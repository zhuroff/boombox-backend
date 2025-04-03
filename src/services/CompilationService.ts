import { Request } from 'express'
import { Types } from 'mongoose'
import { TrackDocument } from '../models/track.model'
import { CompilationRepository, GatheringCreatePayload, GatheringReorder, GatheringUpdatePayload } from '../types/common.types'
import { ListRequestConfig, NewCompilationPayload } from '../types/reqres.types'
import { TrackRepository } from '../types/track.types'
import TrackView from '../views/TrackView'
import GatheringViewFactory from '../views/GatheringViewFactory'
import PaginationViewFactory from '../views/PaginationViewFactory'

export default class CompilationService {
  constructor(
    private compilationRepository: CompilationRepository,
    private trackRepository: TrackRepository
  ) {}

  async createCompilation({ title, entityID }: GatheringCreatePayload) {
    const compilations = await this.compilationRepository.getRawCompilations()

    if (compilations.some((col) => col.title === title)) {
      throw new Error('compilations.exists')
    }

    const payload: NewCompilationPayload = {
      title,
      tracks: [
        {
          track: new Types.ObjectId(entityID),
          order: 1
        }
      ]
    }

    const newCompilation = await this.compilationRepository.createCompilation(payload)
    await this.trackRepository.updateCompilationInTrack({
      listID: newCompilation._id.toString(),
      itemID: entityID,
      inList: false
    })

    return GatheringViewFactory.createGatheringItemView(newCompilation)
  }

  async updateCompilation(payload: GatheringUpdatePayload) {
    await this.compilationRepository.updateCompilation(payload)
    await this.trackRepository.updateCompilationInTrack({
      listID: payload.gatheringID,
      itemID: payload.entityID,
      inList: payload.isInList
    })

    return { message: payload.isInList ? 'compilations.removed' : 'compilations.added' }
  }

  async removeCompilation(id: string) {
    const response = await this.compilationRepository.removeCompilation(id)

    if (!response) {
      throw new Error('Incorrect request options')
    }

    await Promise.all(response.tracks.map(async (track) => (
      await this.trackRepository.updateCompilationInTrack({
        listID: id,
        inList: false,
        itemID: track.track instanceof Types.ObjectId ? track.track : track.track._id
      })))
    )

    return { message: 'compilations.drop' }
  }

  async reorderCompilationTracks({ oldOrder, newOrder }: GatheringReorder, _id: string | Types.ObjectId) {
    const targetCompilation = await this.compilationRepository.getRawCompilation(_id)

    if (!targetCompilation) {
      throw new Error('Incorrect request options')
    }

    targetCompilation.tracks.splice(
      newOrder, 0,
      ...targetCompilation.tracks.splice(oldOrder, 1)
    )

    targetCompilation.tracks.forEach((el, index) => {
      el.order = index + 1
    })

    await this.compilationRepository.updateCompilationOrder(_id, targetCompilation.tracks)
    return { message: 'compilations.reordered' }
  }

  async getCompilations(req: Request) {
    const compilations = await this.compilationRepository.getPaginatedCompilations(req)

    if (!compilations.docs?.every((col) => !!col)) {
      throw new Error('Incorrect request options')
    }

    const { totalDocs, totalPages, page } = compilations
    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })
    const docs = compilations.docs.map((compilation) => (
      GatheringViewFactory.createGatheringItemView(compilation)
    ))

    return { docs, pagination }
  }

  async getCompilation(id: string | Types.ObjectId) {
    const compilation = await this.compilationRepository.getPopulatedCompilation(id)

    if (!compilation) {
      throw new Error('Incorrect request options or compilation not found')
    }

    return GatheringViewFactory.createCompilationPageView(
      compilation,
      compilation.tracks.map(({ track, order }) => {
        const trackDoc = track as TrackDocument
        return new TrackView(trackDoc, order)
      })
    )
  }

  async cleanCompilation(compilations: Map<string, string[]>) {
    await this.compilationRepository.cleanCompilation(compilations)
  }

  async renameCompilation(_id: string, title: string) {
    const query = { _id }
    const update = { title }

    await this.compilationRepository.renameCompilation(query, update)
    return { message: 'compilation.renamed' }
  }

  async getRandomCompilations(size: number, filter: ListRequestConfig['filter']) {
    if (!filter) {
      throw new Error('Incorrect request options: filter is not specified')
    }

    const response = await this.compilationRepository.getRandomCompilations(size, filter)

    if (!response) {
      throw new Error('Incorrect request options')
    }

    return { docs: response }
  }
}
