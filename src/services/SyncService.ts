import { Types } from 'mongoose'
import { Album, AlbumDocument } from '../models/album.model'
import { Collection } from '../models/collection.model'
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
    // return await this.dbUpdateSplitter(cloudFolders, dbFolders)
    await this.removeDuplicates(cloudFolders, dbFolders)
    return []
  }

  async removeDuplicates(_cloudFolders: CloudEntity[], _dbFolders: AlbumDocument[]) {
    type AlbumRow = { _id: Types.ObjectId; title: string; artist?: Types.ObjectId; genre?: Types.ObjectId; period?: Types.ObjectId }
    const albums = (await Album.find({}, { title: 1, artist: 1, genre: 1, period: 1 }).lean()) as unknown as AlbumRow[]

    const key = (a: AlbumRow) =>
      `${a.title}|${a.artist?.toString() ?? 'null'}|${a.genre?.toString() ?? 'null'}|${a.period?.toString() ?? 'null'}`

    const byKey = new Map<string, AlbumRow[]>()
    for (const a of albums) {
      const k = key(a)
      const list = byKey.get(k) ?? []
      list.push(a)
      byKey.set(k, list)
    }

    const toDelete: Types.ObjectId[] = []
    for (const [, group] of byKey) {
      if (group.length <= 1) continue

      const ids = group.map((a) => a._id)
      const inCollections = await Collection.find({ 'albums.album': { $in: ids } })
        .select('albums.album')
        .lean()
      const idsInCollections = new Set(
        inCollections.flatMap((c) => (c.albums ?? []).map((e) => (e.album as Types.ObjectId)?.toString()).filter(Boolean))
      )

      const toKeep = group.find((a) => idsInCollections.has(a._id.toString())) ?? group[0]!
      const rest = group.filter((a) => !a._id.equals(toKeep._id))
      for (const dup of rest) {
        if (idsInCollections.has(dup._id.toString())) {
          const collectionsWithDup = await Collection.find({ 'albums.album': dup._id }).select('_id').lean()
          const collectionIds = collectionsWithDup.map((c) => c._id)
          await Collection.updateMany(
            { 'albums.album': dup._id },
            { $set: { 'albums.$[elem].album': toKeep._id } },
            { arrayFilters: [{ 'elem.album': dup._id }] }
          )
          if (collectionIds.length) {
            await Album.findByIdAndUpdate(toKeep._id, { $addToSet: { inCollections: { $each: collectionIds } } })
          }
        }
        toDelete.push(dup._id)
      }
    }

    for (const id of toDelete) {
      await this.albumService.removeAlbum(id)
    }
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
}
