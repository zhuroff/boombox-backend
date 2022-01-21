import 'module-alias/register'
import { Request, Response } from 'express'
import { Types, PaginateModel } from 'mongoose'
import { fetchers } from '~/helpers/fetchers'
import { Album } from '~/models/album.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'
import { CategoryModel } from '~/types/Category'
import {
  CloudAlbum,
  CloudAlbumFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  AlbumModel,
  AlbumTracksModel,
  AlbumModelDocument
} from '~/types/Album'

type CreatingResponse = {
  albumID: Types.ObjectId,
  artistID: Types.ObjectId,
  genreID: Types.ObjectId,
  periodID: Types.ObjectId
}

const syncSuccess = { status: 201, message: 'Successfully synchronized' }

const getAlbumCover = (array: CloudAlbumFile[]) => {
  const coverFile = array.find((content) => (
    content.contenttype && content.contenttype.includes('image')
  ))
  return coverFile ? coverFile.fileid : 0
}

const getAlbumCoverArt = (array: CloudAlbumFolder[]) => {
  const coverArt = array.find((content) => content.name === 'booklet')
  return coverArt ? coverArt.folderid : 0
}

const getAlbumTracks: any = async (array: CloudAlbumContent[]) => {
  const albumParts = array.filter((el) => (
    el.isfolder && el.name !== 'booklet'
  )) as CloudAlbumFolder[]

  if (albumParts.length) {
    const subFoldersContent = albumParts.map(async (el) => {
      const query = fetchers.cloudQueryLink(`listfolder?folderid=${el.folderid}`)
      const elTracks = await fetchers.getData(query)
      
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

const attachCategoriesToAlbum = async (payload: CreatingResponse) => {
  const { albumID, artistID, genreID, periodID } = payload
  const query = { _id: albumID }
  const options = { new: true }
  const update = {
    artist: artistID,
    genre: genreID,
    period: periodID
  }
  
  return await Album.findOneAndUpdate(query, update, options) as AlbumModelDocument
}

const updateCategoriesInAlbum = async (payload: CreatingResponse[]) => {
  const updating = payload.map(async (el) => (
    await attachCategoriesToAlbum(el)
  ))

  return await Promise.all(updating)
}

const createOrUpdateCategory = async (
  ...args: [PaginateModel<any>, string, AlbumModelDocument]
): Promise<CategoryModel> => {
  const [Model, title, album] = args
  const query = { title: title }
  const update = { $push: { albums: album._doc._id } }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  return await Model.findOneAndUpdate(query, update, options)
}

const saveDatabaseEntries = async (album: AlbumModel): Promise<CreatingResponse> => {
  const { artistTitle, genreTitle, periodYear } = album
  const newAlbum = new Album(album)

  try {
    const dbAlbum = await newAlbum.save()

    const artist: CategoryModel = await createOrUpdateCategory(
      Artist,
      artistTitle || 'unknown artist',
      dbAlbum
    )

    const genre: CategoryModel = await createOrUpdateCategory(
      Genre,
      genreTitle || 'unknown genre',
      dbAlbum
    )

    const period: CategoryModel = await createOrUpdateCategory(
      Period,
      periodYear || 'unknown year',
      dbAlbum
    )

    return {
      albumID: dbAlbum._id,
      artistID: artist._id,
      genreID: genre._id,
      periodID: period._id
    }
  } catch (error) {
    throw error
  }
}

const createDatabaseEntries = async (albums: AlbumModel[]): Promise<CreatingResponse[]> => {
  try {
    const dbCreating = albums.map(async (album) => (
      await saveDatabaseEntries(album)
    ))

    return await Promise.all(dbCreating)
  } catch (error) {
    throw error
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

const buildAlbumsData = async (content: CloudAlbum[], isModified = false) => {
  try {
    const albumsMap = content.map(async (el: CloudAlbum) => {
      const folderQuery = fetchers.cloudQueryLink(`listfolder?folderid=${el.folderid}`)
      const listFolder = await fetchers.getData(folderQuery)
      const folderTracks: AlbumTracksModel[] = await getAlbumTracks(listFolder.data.metadata.contents)
      
      const pcloudData: AlbumModel = {
        title: getAlbumTitle(el.name),
        artistTitle: getArtistName(el.name),
        genreTitle: getAlbumGenre(el.name),
        periodYear: getAlbumReleaseYear(el.name),
        albumCover: getAlbumCover(listFolder.data.metadata.contents),
        albumCoverArt: getAlbumCoverArt(listFolder.data.metadata.contents),
        folderid: el.folderid,        
        modified: el.modified,
        description: '',
        tracks: folderTracks
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

const updateDatabaseEntries = async (albums: CloudAlbum[]) => {
  const buildedAlbums = await buildAlbumsData(albums)
  const createdAlbums = await createDatabaseEntries(buildedAlbums)
  await updateCategoriesInAlbum(createdAlbums)
  return true
}

const unlinkAlbumFromCategory = async (
  ...args: [PaginateModel<CategoryModel>, Types.ObjectId, Types.ObjectId]
): Promise<any> => {
  const [Model, albumID, categoryID] = args
  const query = { id: categoryID }
  const update = { $pull: { albums: albumID } }
  const options = { new: true }

  return Model.findOneAndUpdate(query, update, options)
}

const deleteAlbumFromDatabase = async (album: AlbumModelDocument) => {
  const query = { id: album._id }
  const options = { rawResult: true }
  
  await Album.findOneAndDelete(query, options)
  await unlinkAlbumFromCategory(Artist, album._id, album.artist)
  await unlinkAlbumFromCategory(Genre, album._id, album.genre)
  await unlinkAlbumFromCategory(Period, album._id, album.period)
  return true
}

const deleteDatabaseEntries = async (albums: AlbumModelDocument[]) => {
  try {
    const dbDeleting = albums.map(async (album) => (
      await deleteAlbumFromDatabase(album)
    ))

    return await Promise.all(dbDeleting)
  } catch (error) {
    throw error
  }
}

const dbUpdateSplitter = async (cloudAlbums: CloudAlbum[], dbAlbums: AlbumModelDocument[]) => {
  if (!dbAlbums.length) {
    console.log('Есть что создать!')
    await updateDatabaseEntries(cloudAlbums)
    return syncSuccess
  }

  const albumsToAdd = [] as CloudAlbum[]
  const albumsToDel = [] as AlbumModelDocument[]
  const albumsToFix = [] as { old: AlbumModelDocument, new: CloudAlbum }[]

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
    console.log('Есть что добавить!')
    await updateDatabaseEntries(albumsToAdd)
  }

  if (albumsToDel.length) {
    console.log('Есть что удалить!')
    await deleteDatabaseEntries(albumsToDel)
  }

  if (albumsToFix.length) {
    console.log('Есть что изменить')
  }

  return syncSuccess
}

const synchronizeHandler = async (cloudAlbums: CloudAlbum[]) => {
  const searchConfig = {
    modified: true,
    folderid: true,
    artist: true,
    genre: true,
    period: true
  }

  const dbAlbums = await Album.find({}, searchConfig).exec()

  return await dbUpdateSplitter(cloudAlbums, dbAlbums)
}

const synchronize = async (req: Request, res: Response) => {
  const query = fetchers.cloudQueryLink('listfolder?path=/boombox')

  try {
    const rootFolder = await fetchers.getData(query)
    const cloudContent = rootFolder.data.metadata.contents

    if (!cloudContent.length) {
      return res.json({
        type: 'warning',
        message: 'Your cloud collection is empty'
      })
    }

    if (rootFolder.data.result !== 0) {
      return res.status(500).json(rootFolder.data)
    }

    const response = await synchronizeHandler(cloudContent)
    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  synchronize
}

export default controller
