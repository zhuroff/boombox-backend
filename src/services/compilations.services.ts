import { Types } from 'mongoose'
import { CompilationDTO } from '../dto/compilation.dto'
import { Compilation, CompilationDocument } from '../models/compilation.model'
import { Track } from '../models/track.model'
import { CompilationCreatePayload, CompilationUpdatePayload } from '../types/compilation.types'
import filesServices from './files.services'

export default {
  async create({ title, track }: CompilationCreatePayload) {
    const payload = {
      title,
      tracks: [{ track, order: 1 }]
    }

    const newCompilation = new Compilation(payload)

    await newCompilation.save()
    await this.updateTrack(newCompilation._id, track, false)

    return { message: 'Compilation successfully created' }
  },
  async update({ _id, inList, track, order }: CompilationUpdatePayload) {
    const query = { _id }
    const update = inList
      ? { $pull: { tracks: { track } } }
      : { $push: { tracks: { track, order } } }
    const options = { new: true }

    await Compilation.findOneAndUpdate(query, update, options)
    await this.updateTrack(_id, track, inList)

    return {
      message: inList
        ? 'Track successfully removed from compilation'
        : 'Track successfully added to compilation'
    }
  },
  async cleanCompilation(compilations: Map<string, string[]>) {
    return await Promise.all(Array.from(compilations).map(async ([compilationId, trackIds]) => (
      await Compilation.updateMany(
        { _id: compilationId },
        { $pull: { tracks: { track: { $in: trackIds } } } }
      )
    )))
  },
  async getList() {
    const config = { title: true, tracks: true, avatar: true }
    const response = await Compilation.find({}, config).sort({ title: 1 }).exec()

    if (response) {
      return response.map((el) => new CompilationDTO(el))
    }

    throw new Error('Incorrect request options')
  },
  async single(id: string) {
    const dbCompilation: CompilationDocument = await Compilation.findById(id)
      .populate({
        path: 'tracks.track',
        select: ['title', 'listened', 'duration', 'path'],
        populate: [
          {
            path: 'artist',
            select: ['title']
          },
          {
            path: 'inAlbum',
            select: ['title', 'albumCover'],
            options: { lean: true },
            populate: [
              { path: 'period', select: ['title'] },
              { path: 'genre', select: ['title'] }
            ]
          }
        ]
      })
      .lean()

    if (dbCompilation) {
      // const promisedTracks = dbCompilation.tracks.map(async ({ track, order }) => {
      //   const trackRes = await CloudLib.get<CloudFile>(track.path)
      //   const albumCoverRes = await CloudLib.get<CloudFile>(track.inAlbum.albumCover)
      //   return {
      //     order,
      //     ...{
      //       ...new TrackDTO({ ...track, ...trackRes.data }),
      //       inAlbum: {
      //         ...track.inAlbum,
      //         albumCover: albumCoverRes.data.file
      //       }
      //     }
      //   }
      // })

      // return { ...dbCompilation, tracks: await Promise.all(promisedTracks) }
    }

    throw new Error('Incorrect request options')
  },
  async remove(_id: string) {
    const response = await Compilation.findByIdAndDelete({ _id })
    const tracks = response?.tracks
    const images = [response?.poster, response?.avatar]
      .reduce<string[]>((acc, next) => {
        if (next !== undefined) {
          acc.push(next)
        }

        return acc
      }, [])

    if (tracks && tracks.length > 0) {
      // @ts-ignore
      tracks.map(async (el) => await this.updateTrack(_id, el.track, true))
    }

    if (images.length > 0) {
      filesServices.remove(images)
    }

    return { message: 'Compilation was successfully deleted' }
  },
  async reorder({ oldOrder, newOrder }: any /* CollectionReorder */, _id: string) {
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

      return { message: 'Order successfully updated' }
    }

    throw new Error('Incorrect request options')
  },
  async rename(_id: string, title: string) {
    const query = { _id }
    const update = { title }

    await Compilation.findOneAndUpdate(query, update)

    return { message: 'Compilation title was successfully updated' }
  },
  async updateTrack(listID: Types.ObjectId | string, trackID: Types.ObjectId | string, inList: boolean) {
    const query = { _id: trackID }
    const update = inList
      ? { $pull: { inCompilations: listID } }
      : { $push: { inCompilations: listID } }
    const options = { new: true }

    await Track.findOneAndUpdate(query, update, options)
  }
}
