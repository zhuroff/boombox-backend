import 'module-alias/register'
import { Request, Response } from 'express'
import { Types, PaginateModel } from 'mongoose'
import { CloudLib } from '~/lib/cloud.lib'
import { Album } from '~/models/album.model'
import { Track } from '~/models/track.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'
import { Collection } from '~/models/collection.model'
import { Playlist } from '~/models/playlist.model'
import { CategoryModel } from '~/types/Category'
import { CloudTrack, TrackModel } from '~/types/Track'
import {
  CloudFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  PreparedAlbum,
  IAlbum
} from '~/types/Album'

type CreatingResponse = {
  albumID: Types.ObjectId,
  artistID: Types.ObjectId,
  genreID: Types.ObjectId,
  periodID: Types.ObjectId
}

const syncSuccessResponse = { status: 201, message: 'Successfully synchronized' }

/* ========================== CREATE ENTRY ============================= */

const getAlbumCover = (array: CloudAlbumFile[]) => {
  const coverFile = array.find((content) => (
    content.contenttype && content.contenttype.includes('application/octet-stream')
  ))
  return coverFile ? coverFile.fileid : 0
}

const getAlbumCoverArt = (array: CloudFolder[]) => {
  const coverArt = array.find((content) => content.name === 'booklet')
  return coverArt ? coverArt.folderid : 0
}

const getAlbumTracks: any = async (array: CloudAlbumContent[]) => {
  const albumParts = array.filter((el) => (
    el.isfolder && el.name !== 'booklet'
  )) as CloudFolder[]

  if (albumParts.length) {
    const subFoldersContent = albumParts.map(async (el) => {
      const query = CloudLib.cloudQueryLink(`listfolder?folderid=${el.folderid}`)
      const elTracks = await CloudLib.get(query)
      
      return elTracks.data.metadata.contents
    })

    const content = await Promise.all(subFoldersContent)

    return getAlbumTracks(content.flat())
  } else {
    const modifiedArray = (array as CloudAlbumTrack[])
      .filter((el) => el.contenttype && el.contenttype.includes('audio'))
      .map((el) => {
        const splitName = el.name.split('.')
        splitName.shift()
        splitName.pop()
        el.title = splitName.join('.').trim()

        return el
      })

    return modifiedArray
  }
}

const getAlbumTitle = (name: string) => {
  const albumTitleRegExp = /\]([^)]+)\#/
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
  ...args: [CloudTrack, Types.ObjectId, Types.ObjectId]
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
  ...args: [CloudTrack[], Types.ObjectId, Types.ObjectId]
): Promise<Types.ObjectId[]> => {
  const [tracks, albumID, artistID] = args

  try {
    const tracksSaving = tracks.map(async (track) => (
      await createAndSaveTrackEntry(track, albumID, artistID)
    ))

    return await Promise.all(tracksSaving)
  } catch (error) {
    throw error
  }
}

const buildAlbumsData = async (content: CloudFolder[], isModified = false) => {
  try {
    const albumsMap = content.map(async (el: CloudFolder) => {
      const folderQuery = CloudLib.cloudQueryLink(`listfolder?folderid=${el.folderid}`)
      const listFolder = await CloudLib.get(folderQuery)
      const folderTracks: CloudTrack[] = await getAlbumTracks(listFolder.data.metadata.contents)
      
      const pcloudData: PreparedAlbum = {
        title: getAlbumTitle(el.name),
        artist: getArtistName(el.name),
        genre: getAlbumGenre(el.name),
        period: getAlbumReleaseYear(el.name),
        albumCover: getAlbumCover(listFolder.data.metadata.contents),
        albumCoverArt: getAlbumCoverArt(listFolder.data.metadata.contents),
        folderid: el.folderid,        
        modified: el.modified,
        description: '',
        folderTracks
      }

      return pcloudData
    })

    const albums = await Promise.all(albumsMap)

    // if (isModified) {
    //   return modifyAlbumsInDataBase(albums)
    // }
    
    return albums
  } catch (error) {
    throw error
  }
}

const createOrUpdateCategory = async (
  ...args: [PaginateModel<any>, string, Types.ObjectId]
): Promise<CategoryModel> => {
  const [Model, title, albumID] = args
  const query = { title: title }
  const update = { $push: { albums: albumID } }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  return await Model.findOneAndUpdate(query, update, options)
}

const saveDatabaseEntries = async (album: PreparedAlbum): Promise<CreatingResponse> => {
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

    const dbTracks = await saveTracksToDatabase(
      album.folderTracks,
      newAlbum._id,
      dbArtist._id
    )

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

  } catch (error) {
    throw error
  }
}

const createDatabaseEntries = async (albums: PreparedAlbum[]): Promise<CreatingResponse[]> => {
  try {
    const dbCreating = albums.map(async (album) => (
      await saveDatabaseEntries(album)
    ))

    return await Promise.all(dbCreating)
  } catch (error) {
    throw error
  }
}

const updateDatabaseEntries = async (albums: CloudFolder[]) => {
  try {
    const buildedAlbums = await buildAlbumsData(albums)
    await createDatabaseEntries(buildedAlbums)
    return true
  } catch (error) {
    throw error
  }
}

/* ========================== DELETE ENTRY ============================= */

const dropTrack = async (trackID: Types.ObjectId) => {
  try {
    return await Track.deleteOne({ _id: trackID })
  } catch (error) {
    throw error
  }
}

const deleteTracksFromDatabase = async (tracks: TrackModel[]) => {
  try {
    const deletingTracks = tracks.map(async (track) => (
      await dropTrack(track._id)
    ))

    return await Promise.all(deletingTracks)
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

const deleteAlbumsFromDatabase = async (albums: IAlbum[]) => {
  try {
    const dbDeleting = albums.map(async (album) => (
      await dropAlbum(album._id)
    ))

    return await Promise.all(dbDeleting)
  } catch (error) {
    throw error
  }
}

const unlinkCategory = async (
  ...args: [PaginateModel<CategoryModel>, Types.ObjectId, Types.ObjectId]
): Promise<any> => {
  const [Model, albumID, categoryID] = args
  const query = { _id: categoryID }
  const update = { $pull: { albums: albumID } }
  const options = { new: true }

  return await Model.findOneAndUpdate(query, update, options)
}

const unlinkCategoriesFromAlbum = async (albums: IAlbum[]) => {
  try {
    const dbUnlinked = albums.map(async (album) => {
      await unlinkCategory(Artist, album._id, album.artist)
      await unlinkCategory(Genre, album._id, album.genre)
      await unlinkCategory(Period, album._id, album.period)
      return true
    })

    return await Promise.all(dbUnlinked)
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

const unlinkAlbum = async (album: IAlbum) => {
  if (!album.inCollections.length) return true

  const unlinked = album.inCollections.map(async (collectionID) => (
    await unlinkCollection(collectionID, album._id)
  ))

  return await Promise.all(unlinked)
}

const unlinkAlbumsFromCollections = async (albums: IAlbum[]) => {
  const unlinked = albums.map(async (album) => (
    await unlinkAlbum(album)
  ))

  return await Promise.all(unlinked)
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

const unlinkTrack = async (track: TrackModel) => {
  if (!track.inPlaylists.length) return true

  const unlinked = track.inPlaylists.map(async (playlistID) => (
    await unlinkPlaylist(playlistID, track._id)
  ))

  return await Promise.all(unlinked)
}

const unlinkTracksFromPlaylists = async (tracks: TrackModel[]) => {
  const unlinked = tracks.map(async (track) => (
    await unlinkTrack(track)
  ))

  return await Promise.all(unlinked)
}

const deleteDatabaseEntries = async (albums: IAlbum[]) => {
  const tracks = albums.flatMap((album) => (
    album.tracks as TrackModel[]
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

const dbUpdateSplitter = async (cloudAlbums: CloudFolder[], dbAlbums: IAlbum[]) => {
  if (!dbAlbums.length && cloudAlbums.length) {
    await updateDatabaseEntries(cloudAlbums)
    return true
  }

  const albumsToAdd = [] as CloudFolder[]
  const albumsToDel = [] as IAlbum[]
  const albumsToFix = [] as { old: IAlbum, new: CloudFolder }[]

  cloudAlbums.forEach((cloudAlbum) => {
    const matched = dbAlbums.find((dbAlbum) => (
      dbAlbum.folderid === cloudAlbum.folderid
    ))

    if (matched) {
      matched.toStay = true

      const dbModifiedDate = new Date(matched.modified).getTime()
      const cloudModifiedDate = new Date(cloudAlbum.modified).getTime()

      if (dbModifiedDate !== cloudModifiedDate) {
        albumsToFix.push({ old: matched, new: cloudAlbum })
      }
    } else {
      albumsToAdd.push(cloudAlbum)
    }
  })

  albumsToDel.push(...dbAlbums.filter((el) => !el.toStay))

  if (albumsToAdd.length) {
    await updateDatabaseEntries(albumsToAdd)
  }

  if (albumsToDel.length) {
    await deleteDatabaseEntries(albumsToDel)
  }

  if (albumsToFix.length) {
    console.log(albumsToFix)
  }

  return true
}

const fetchDatabaseAlbums = async () => {
  const searchConfig = {
    modified: true,
    folderid: true,
    artist: true,
    genre: true,
    period: true,
    tracks: true,
    inCollections: true
  }

  return await Album.find({}, searchConfig)
    .populate({ path: 'tracks', select: ['inPlaylists'] })
    .exec()
}

const synchronize = async (req: Request, res: Response) => {
  const query = CloudLib.cloudQueryLink('listfolder?path=/boombox')

  try {
    const rootFolder = await CloudLib.get(query)
    const cloudAlbums = rootFolder.data.metadata.contents

    if (rootFolder.data.result !== 0) {
      return res.status(500).json(rootFolder.data)
    }

    const dbAlbums = await fetchDatabaseAlbums()
    await dbUpdateSplitter(cloudAlbums, dbAlbums)

    res.json(syncSuccessResponse)
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  synchronize
}

export default controller
