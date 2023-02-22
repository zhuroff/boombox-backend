import { Request, Response } from 'express'
import { Types, PaginateModel } from 'mongoose'

import { CloudLib } from '../lib/cloud.lib'
import { Album } from '../models/album.model'
import { Track } from '../models/track.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Collection } from '../models/collection.model'
import { Playlist } from '../models/playlist.model'
import { CategoryDocument } from '../types/Category'
// @ts-ignore
import { AlbumDocumentExt, AlbumDocument } from '../types/Album'
// @ts-ignore
import { CloudFolder, CloudFolderItem, UnionCloudsFolder } from '../types/Cloud'
import { TrackExtPlaylist, TrackReqPayload } from '../types/Track'

// import syncService from '../services/sync.service'
// @ts-ignore
// import { CloudService } from '../services/cloud.service'

import { CloudFolderDTO } from '../dtos/cloud.dto'

export const sanitizeURL = (path: string) => (
  encodeURIComponent(path.replace('disk:/', ''))
)

/* ========================== CREATE ENTRY ============================= */

const getAlbumCoverLink = (folderItems: CloudFolderItem[]) => {
  const coverItem = folderItems.find(({ name }) => name === 'cover.webp')
  return coverItem && 'path' in coverItem ? sanitizeURL(coverItem.path) : ''
}

const getAlbumCoverArtPath = (folderItems: CloudFolderItem[]) => {
  const folderPath = folderItems.find(({ name }) => name === 'booklet')?.path
  return folderPath ? sanitizeURL(folderPath) : undefined
}

const getAlbumTracks = async (folderTracks: CloudFolderItem[]) => {
  const tracks = folderTracks.reduce<TrackReqPayload[]>((acc, next) => {
    if (
      'media_type' in next &&
      next.media_type === 'audio'
    ) {
      acc.push({
        title: next.name.replace(/\.[^/.]+$/, "").slice(4),
        created: next.created,
        modified: next.modified,
        path: sanitizeURL(next.path),
        mime_type: next.mime_type,
        media_type: next.media_type
      })
    }

    return acc
  }, [])

  return tracks
}

const getAlbumTitle = (name: string) => {
  const albumTitleRegExp = /\]\s*(.+?)\s*#/
  const albumTitle = albumTitleRegExp.exec(name)
  const albumTitleResult = albumTitle && albumTitle[1] ? albumTitle[1].trim() : 'unknown album'

  return albumTitleResult
}

const getArtistName = (name: string) => {
  const albumArtist = name.split('\[')[0]
  const artistTitleResult = albumArtist ? albumArtist.trim() : 'unknown artist'

  return artistTitleResult
}

const getAlbumGenre = (name: string) => {
  const albumGenre = name.split('#')[1]
  return albumGenre || 'unknown genre'
}

const getAlbumReleaseYear = (name: string) => {
  const albumYearRegExp = /\[([^)]+)\]/
  const albumYear = albumYearRegExp.exec(name)
  const albumYearResult = albumYear && albumYear[1] ? albumYear[1] : 'unknown year'

  return albumYearResult
}

const createAndSaveTrackEntry = async (
  ...args: [TrackReqPayload, Types.ObjectId, Types.ObjectId]
) => {
  const [track, albumID, artistID] = args

  const preparedTrack = {
    ...track,
    inAlbum: albumID,
    artist: artistID
  }

  try {
    const newTrack = new Track(preparedTrack)
    const dbTrack = await newTrack.save()
    return dbTrack._id
  } catch (error) {
    throw error
  }
}

const saveTracksToDatabase = async (
  ...args: [TrackReqPayload[], Types.ObjectId, Types.ObjectId]
) => {
  const [tracks, albumID, artistID] = args

  try {
    const tracksSaving = tracks.map(async (track) => (
      await createAndSaveTrackEntry(track, albumID, artistID)
    ))

    return await Promise.allSettled(tracksSaving)
  } catch (error) {
    throw error
  }
}

const buildAlbumsData = (folders: CloudFolderItem[]) => {
  const albumsMap = folders.map(async (el) => {
    const content = await CloudLib.get<CloudFolder>(sanitizeURL(el.path))
    // @ts-ignore
    const preparedAlbumData: AlbumPreform = {
      title: getAlbumTitle(el.name),
      artist: getArtistName(el.name),
      genre: getAlbumGenre(el.name),
      period: getAlbumReleaseYear(el.name),
      // @ts-ignore
      albumCover: getAlbumCoverLink(content.data._embedded.items),
      // @ts-ignore
      albumCoverArt: getAlbumCoverArtPath(content.data._embedded.items),
      // @ts-ignore
      folderTracks: await getAlbumTracks(content.data._embedded.items),
      modified: el.modified,
      description: ''
    }

    return preparedAlbumData
  })

  return Promise.allSettled(albumsMap)
}

const createOrUpdateCategory = async <T,>(
  ...args: [PaginateModel<T>, string, Types.ObjectId]
) => {
  const [Model, title, albumID] = args
  const query = { title: title }
  const update = { $push: { albums: albumID } }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  return await Model.findOneAndUpdate(query, update, options)
}
// @ts-ignore
const saveDatabaseEntries = async (album: AlbumPreform) => {
  const { artist, genre, period } = album
  const newAlbum = new Album(album)

  try {
    const dbArtist = await createOrUpdateCategory(
      Artist,
      artist || 'unknown artist',
      newAlbum._id
    )

    const dbGenre = await createOrUpdateCategory(
      Genre,
      genre || 'unknown genre',
      newAlbum._id
    )

    const dbPeriod = await createOrUpdateCategory(
      Period,
      period || 'unknown year',
      newAlbum._id
    )

    if (dbArtist && dbGenre && dbPeriod) {
      const dbTracks = await saveTracksToDatabase(
        // @ts-ignore
        album.folderTracks,
        newAlbum._id,
        dbArtist._id
      )
      // @ts-ignore
      newAlbum.tracks = dbTracks
      newAlbum.artist = dbArtist._id
      newAlbum.genre = dbGenre._id
      newAlbum.period = dbPeriod._id

      await newAlbum.save()

      return {
        albumID: newAlbum._id,
        artistID: dbArtist._id,
        genreID: dbGenre._id,
        periodID: dbPeriod._id
      }
    }

    return false
  } catch (error) {
    throw error
  }
}
// @ts-ignore
const createDatabaseEntries = async (albums: PromiseSettledResult<AlbumPreform>[]) => {
  console.log(saveDatabaseEntries)
  console.log(albums)
  return await Promise.resolve([])
  // try {
  //   const dbCreating = albums.map(async (album) => (
  //     await saveDatabaseEntries(album)
  //   ))

  //   return await Promise.allSettled(dbCreating)
  // } catch (error) {
  //   throw error
  // }
}

/* ========================== DELETE ENTRY ============================= */

const dropTrack = async (trackID: Types.ObjectId) => {
  try {
    return await Track.deleteOne({ _id: trackID })
  } catch (error) {
    throw error
  }
}

const deleteTracksFromDatabase = async (tracks: TrackExtPlaylist[]) => {
  try {
    const deletingTracks = tracks.map(async ({ _id }) => (
      await dropTrack(_id)
    ))

    return await Promise.allSettled(deletingTracks)
  } catch (error) {
    throw error
  }
}

const dropAlbum = async (id: Types.ObjectId) => {
  try {
    await Album.deleteOne({ _id: id })
  } catch (error) {
    throw error
  }
}

const deleteAlbumsFromDatabase = async (albums: AlbumDocumentExt[]) => {
  try {
    const dbDeleting = albums.map(async (album) => (
      await dropAlbum(album._id)
    ))

    return await Promise.allSettled(dbDeleting)
  } catch (error) {
    throw error
  }
}

const unlinkCategory = async (
  ...args: [PaginateModel<CategoryDocument>, Types.ObjectId, Types.ObjectId]
): Promise<any> => {
  const [Model, albumID, categoryID] = args
  const query = { _id: categoryID }
  const update = { $pull: { albums: albumID } }
  const options = { new: true }

  return await Model.findOneAndUpdate(query, update, options)
}

const unlinkCategoriesFromAlbum = async (albums: AlbumDocumentExt[]) => {
  try {
    const dbUnlinked = albums.map(async (album) => {
      await unlinkCategory(Artist, album._id, album.artist)
      await unlinkCategory(Genre, album._id, album.genre)
      await unlinkCategory(Period, album._id, album.period)
      return true
    })

    return await Promise.allSettled(dbUnlinked)
  } catch (error) {
    throw error
  }
}

const unlinkCollection = async (collectionID: Types.ObjectId, albumID: Types.ObjectId) => {
  const query = { _id: collectionID }
  const update = { $pull: { albums: { album: albumID } } }
  const options = { new: true }

  try {
    return await Collection.findOneAndUpdate(query, update, options)
  } catch (error) {
    throw error
  }
}

const unlinkAlbum = async (album: AlbumDocumentExt) => {
  if (!album.inCollections.length) return true

  const unlinked = album.inCollections.map(async (collectionID) => (
    await unlinkCollection(collectionID, album._id)
  ))

  return await Promise.allSettled(unlinked)
}

const unlinkAlbumsFromCollections = async (albums: AlbumDocumentExt[]) => {
  const unlinked = albums.map(async (album) => (
    await unlinkAlbum(album)
  ))

  return await Promise.allSettled(unlinked)
}

const unlinkPlaylist = async (playlistID: Types.ObjectId, trackID: Types.ObjectId) => {
  const query = { _id: playlistID }
  const update = { $pull: { tracks: { track: trackID } } }
  const options = { new: true }

  try {
    return await Playlist.findOneAndUpdate(query, update, options)
  } catch (error) {
    throw error
  }
}

const unlinkTrack = async (track: TrackExtPlaylist) => {
  if (!track.inPlaylists.length) return true

  const unlinked = track.inPlaylists.map(async (playlistID) => (
    await unlinkPlaylist(playlistID, track._id)
  ))

  return await Promise.allSettled(unlinked)
}

const unlinkTracksFromPlaylists = async (tracks: TrackExtPlaylist[]) => {
  const unlinked = tracks.map(async (track) => (
    await unlinkTrack(track)
  ))

  return await Promise.allSettled(unlinked)
}

const deleteDatabaseEntries = async (albums: AlbumDocumentExt[]) => {
  const tracks = albums.flatMap((album) => (
    album.tracks
  ))


  try {
    await unlinkAlbumsFromCollections(albums)
    await unlinkTracksFromPlaylists(tracks)
    await deleteTracksFromDatabase(tracks)
    await deleteAlbumsFromDatabase(albums)
    await unlinkCategoriesFromAlbum(albums)

    return true
  } catch (error) {
    throw error
  }
}

/* ========================== PREPARING ============================= */

const dbUpdateSplitter = async (cloudAlbums?: CloudFolderItem[], dbAlbums?: AlbumDocumentExt[]) => {
  if (!cloudAlbums) {
    throw new Error('Cloud root directory is not exist')
  }

  if (!dbAlbums) {
    throw new Error('Database album documents are not exist')
  }

  if (!dbAlbums.length && cloudAlbums.length) {
    return await createDatabaseEntries(await buildAlbumsData(cloudAlbums))
  }

  const albumsToAdd: CloudFolderItem[] = []
  const albumsToDel: AlbumDocumentExt[] = []

  cloudAlbums.forEach((cloudAlbum) => {
    const matched: AlbumDocumentExt | undefined = dbAlbums.find(({ title }) => (
      // @ts-ignore
      title === cloudAlbum.title
    ))

    matched ? matched.toStay = true : albumsToAdd.push(cloudAlbum)
  })

  albumsToDel.push(...dbAlbums.filter((el) => !el.toStay))
  console.log(deleteDatabaseEntries)

  // if (albumsToAdd.length) {
  //   await createDatabaseEntries(await buildAlbumsData(albumsToAdd))
  // }

  // if (albumsToDel.length) {
  //   await deleteDatabaseEntries(albumsToDel)
  // }

  return true
}

const fetchDatabaseAlbums = async () => {
  const searchConfig = {
    modified: true,
    artist: true,
    genre: true,
    period: true,
    tracks: true,
    inCollections: true,
  }

  return await Album.find({}, searchConfig)
    .populate<
      { tracks: TrackExtPlaylist[] }
    >({ path: 'tracks', select: ['inPlaylists'] })
    .exec()
}

const synchronize = async (req: Request, res: Response) => {
  const dbAlbums = await fetchDatabaseAlbums()

  await CloudLib.get<CloudFolder>('Boombox/Collection')
    // @ts-ignore
    .then((response) => response.data._embedded.items)
    .then(async (cloudFolder) => {
      // @ts-ignore
      await dbUpdateSplitter(cloudFolder, dbAlbums)
        && res.status(200).json({ message: 'Successfully synchronized' })
    })
    .catch((error) => {
      res.status(500).json(error)
    })
}

export default synchronize