import 'module-alias/register'
import { Types } from 'mongoose'
import { PlaylistItemDTO } from '~/dtos/playlist.dto'
import { ApiError } from '~/exceptions/api-errors'
import { Playlist } from '~/models/playlist.model'
import { Track } from '~/models/track.model'
import { CollectionReorder } from '~/types/Collection'
import { PlayListCreatePayload, PlayListUpdatePayload, PlaylistResponse } from '~/types/Playlist'
import filesServices from '~/services/files.services'
import { CloudLib } from '~/lib/cloud.lib'
import { CloudFile } from '~/types/Cloud'
import { TrackDTO } from '~/dtos/track.dto'

class PlaylistsServices {
  async create({ title, track }: PlayListCreatePayload) {
    const payload = {
      title,
      tracks: [{ track, order: 1 }]
    }

    const newPlaylist = new Playlist(payload)

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

    await Playlist.findOneAndUpdate(query, update, options)
    await this.updateTrack(_id, track, inList)

    return {
      message: inList
        ? 'Track successfully removed from playlist'
        : 'Track successfully added to playlist'
    }
  }

  async list() {
    const config = { title: true, tracks: true, avatar: true }
    const response = await Playlist.find({}, config).sort({ title: 1 }).exec()

    if (response) {
      return response.map((el) => new PlaylistItemDTO(el))
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string) {
    const dbPlaylist: PlaylistResponse = await Playlist.findById(id)
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
      const promisedTracks = dbPlaylist.tracks.map(async ({ track, order }) => {
        const trackRes = await CloudLib.get<CloudFile>(track.path)
        const albumCoverRes = await CloudLib.get<CloudFile>(track.inAlbum.albumCover)
        return {
          order,
          ...{
            ...new TrackDTO({ ...track, ...trackRes.data }),
            inAlbum: {
              ...track.inAlbum,
              albumCover: albumCoverRes.data.file
            }
          }
        }
      })

      return { ...dbPlaylist, tracks: await Promise.all(promisedTracks) }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async remove(_id: string) {
    const response = await Playlist.findByIdAndDelete({ _id })
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

    return { message: 'Playlist was successfully deleted' }
  }

  async reorder({ oldOrder, newOrder }: CollectionReorder, _id: string) {
    const targetPlaylist = await Playlist.findById(_id).exec()

    if (targetPlaylist) {
      targetPlaylist.tracks.splice(
        newOrder, 0,
        ...targetPlaylist.tracks.splice(oldOrder, 1)
      )

      targetPlaylist.tracks.forEach((el, index) => {
        el.order = index + 1
      })

      await Playlist.updateOne({ _id }, { $set: { tracks: targetPlaylist.tracks } })

      return { message: 'Order successfully updated' }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async rename(_id: string, title: string) {
    const query = { _id }
    const update = { title }

    await Playlist.findOneAndUpdate(query, update)

    return { message: 'Playlist title was successfully updated' }
  }

  async updateTrack(listID: Types.ObjectId | string, trackID: Types.ObjectId | string, inList: boolean) {
    const query = { _id: trackID }
    const update = inList
      ? { $pull: { inPlaylists: listID } }
      : { $push: { inPlaylists: listID } }
    const options = { new: true }

    await Track.findOneAndUpdate(query, update, options)
  }
}

export default new PlaylistsServices()
