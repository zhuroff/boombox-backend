import { Types } from 'mongoose'
import { CompilationDTO } from '../dto/compilation.dto'
import { Compilation, CompilationDocument } from '../models/compilation.model'
import { Track } from '../models/track.model'
import { PlayListCreatePayload, PlayListUpdatePayload } from '../types/compilation.types'
import filesServices from './files.services'

class PlaylistsServices {
  async create({ title, track }: PlayListCreatePayload) {
    const payload = {
      title,
      tracks: [{ track, order: 1 }]
    }

    const newPlaylist = new Compilation(payload)

    await newPlaylist.save()
    await this.updateTrack(newPlaylist._id, track, false)

    return { message: 'Playlist successfully created' }
  }

  async update({ _id, inList, track, order }: PlayListUpdatePayload) {
    const query = { _id }
    const update = inList
      ? { $pull: { tracks: { track } } }
      : { $push: { tracks: { track, order } } }
    const options = { new: true }

    await Compilation.findOneAndUpdate(query, update, options)
    await this.updateTrack(_id, track, inList)

    return {
      message: inList
        ? 'Track successfully removed from playlist'
        : 'Track successfully added to playlist'
    }
  }

  async cleanPlaylist(playlists: Map<string, string[]>) {
    return await Promise.all(Array.from(playlists).map(async ([playlistId, trackIds]) => (
      await Compilation.updateMany(
        { _id: playlistId },
        { $pull: { tracks: { track: { $in: trackIds } } } }
      )
    )))
  }

  async getAllPlaylists() {
    const config = { title: true, tracks: true, avatar: true }
    const response = await Compilation.find({}, config).sort({ title: 1 }).exec()

    if (response) {
      return response.map((el) => new CompilationDTO(el))
    }

    throw new Error('Incorrect request options')
  }

  async single(id: string) {
    const dbPlaylist: CompilationDocument = await Compilation.findById(id)
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

    if (dbPlaylist) {
      // const promisedTracks = dbPlaylist.tracks.map(async ({ track, order }) => {
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

      // return { ...dbPlaylist, tracks: await Promise.all(promisedTracks) }
    }

    throw new Error('Incorrect request options')
  }

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
  }

  async reorder({ oldOrder, newOrder }: any /* CollectionReorder */, _id: string) {
    const targetPlaylist = await Compilation.findById(_id).exec()

    if (targetPlaylist) {
      targetPlaylist.tracks.splice(
        newOrder, 0,
        ...targetPlaylist.tracks.splice(oldOrder, 1)
      )

      targetPlaylist.tracks.forEach((el, index) => {
        el.order = index + 1
      })

      await Compilation.updateOne({ _id }, { $set: { tracks: targetPlaylist.tracks } })

      return { message: 'Order successfully updated' }
    }

    throw new Error('Incorrect request options')
  }

  async rename(_id: string, title: string) {
    const query = { _id }
    const update = { title }

    await Compilation.findOneAndUpdate(query, update)

    return { message: 'Playlist title was successfully updated' }
  }

  async updateTrack(listID: Types.ObjectId | string, trackID: Types.ObjectId | string, inList: boolean) {
    const query = { _id: trackID }
    const update = inList
      ? { $pull: { inCompilations: listID } }
      : { $push: { inCompilations: listID } }
    const options = { new: true }

    await Track.findOneAndUpdate(query, update, options)
  }
}

export default new PlaylistsServices()
