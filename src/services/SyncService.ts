import mongoose from 'mongoose'
import { Album, AlbumDocument } from '../models/album.model'
import { SyncRepository } from '../types/sync'
import { CloudEntity } from '../types/cloud'
import AlbumService from './AlbumService'

export default class SyncService {
  #root = 'MelodyMap/Collection'

  constructor(
    private repository: SyncRepository,
    private albumService: AlbumService
  ) {}

  async synchronize() {
    const cloudFoldersRes = await this.repository.fetchCloudFolders(`/${this.#root}`)
    const dbFolders = await this.albumService.getAlbumDocs()
    const cloudFolders = cloudFoldersRes.flatMap((el) => el ?? [])
    return await this.dbUpdateSplitter(cloudFolders, dbFolders)
  }

  async dbUpdateSplitter(cloudFolders: CloudEntity[], dbFolders: AlbumDocument[]) {
    if (!dbFolders.length && !cloudFolders.length) {
      return Promise.resolve({
        added: [],
        updated: [],
        deleted: [],
        invalid: []
      })
    }

    if (!cloudFolders.length && dbFolders.length) {
      const deleted = await this.albumService.removeAlbums(dbFolders.map(({ _id }) => _id))
      return {
        added: [],
        updated: [],
        invalid: [],
        deleted
      }
    }

    if (!dbFolders.length && cloudFolders.length) {
      return await this.albumService.createAlbums(cloudFolders)
    }

    const dbFoldersMap = new Map(dbFolders.map((folder) => [folder.folderName, folder]))
    const albumsToAdd: CloudEntity[] = []
    const albumsToFix: AlbumDocument[] = []

    cloudFolders.forEach((folder) => {
      const dbFolder = dbFoldersMap.get(folder.title)
      
      if (dbFolder) {
        if (dbFolder.cloudURL !== folder.cloudURL) {
          dbFolder.cloudURL = folder.cloudURL
          albumsToFix.push(dbFolder)
        }
        dbFoldersMap.delete(folder.title)
      } else {
        albumsToAdd.push(folder)
      }
    })

    const addedAlbums = albumsToAdd.length
      ? await this.albumService.createAlbums(albumsToAdd)
      : { added: [], invalid: [] }

    const fixedAlbums = albumsToFix.length
      ? await this.albumService.updateAlbumsClouds(albumsToFix)
      : []

    const deletedAlbums = dbFoldersMap.size
      ? await this.albumService.removeAlbums([...dbFoldersMap].map(([, next]) => next._id))
      : []

    return {
      ...addedAlbums,
      updated: fixedAlbums,
      deleted: deletedAlbums
    }
  }

  async migrateAlbumArtistsToArray() {
    const albumResult = await Album.updateMany(
      { artist: { $exists: true, $ne: null } },
      [{ $set: { artists: ['$artist'] } }, { $unset: 'artist' }]
    )

    const db = mongoose.connection.db
    if (!db) throw new Error('Database connection is not established')

    const embeddedsCollection = db.collection('embeddeds')
    const embeddedsDropped = await embeddedsCollection.drop().catch(() => false)

    const [artistResult, genreResult, periodResult] = await Promise.all([
      db.collection('artists').updateMany({}, { $unset: { embeddedAlbums: '' } }),
      db.collection('genres').updateMany({}, { $unset: { embeddedAlbums: '' } }),
      db.collection('periods').updateMany({}, { $unset: { embeddedAlbums: '' } })
    ])

    return {
      albums: { modifiedCount: albumResult.modifiedCount, matchedCount: albumResult.matchedCount },
      embeddeds: { dropped: embeddedsDropped },
      artists: { modifiedCount: artistResult.modifiedCount, matchedCount: artistResult.matchedCount },
      genres: { modifiedCount: genreResult.modifiedCount, matchedCount: genreResult.matchedCount },
      periods: { modifiedCount: periodResult.modifiedCount, matchedCount: periodResult.matchedCount }
    }
  }
}
