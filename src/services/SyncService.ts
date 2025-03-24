import { AlbumDocument } from '../models/album.model'
import { SyncRepository } from '../types/sync.types'
import { CloudEntityDTO } from '../types/cloud.types'
import AlbumService from './AlbumService'

export default class SyncService {
  constructor(
    private repository: SyncRepository,
    private albumService: AlbumService
  ) {}

  async synchronize() {
    const cloudFoldersRes = await this.repository.fetchCloudFolders()
    const dbFolders = await this.albumService.getAlbumDocs()
    const cloudFolders = cloudFoldersRes.flatMap((el) => el ?? [])
    return await this.dbUpdateSplitter(cloudFolders, dbFolders)
  }

  async dbUpdateSplitter(cloudFolders: CloudEntityDTO[], dbFolders: AlbumDocument[]) {
    if (!dbFolders.length && !cloudFolders.length) {
      return Promise.resolve({
        added: 0,
        updated: 0,
        deleted: 0,
        invalid: 0
      })
    }

    if (!cloudFolders.length && dbFolders.length) {
      const deleted = await this.albumService.removeAlbums(dbFolders.map(({ _id }) => _id))
      return {
        added: 0,
        updated: 0,
        deleted: deleted.length,
        invalid: 0
      }
    }

    if (!dbFolders.length && cloudFolders.length) {
      return await this.albumService.createAlbums(cloudFolders)
    }

    const dbFoldersMap = new Map(dbFolders.map((folder) => [folder.folderName, folder]))
    const albumsToAdd: CloudEntityDTO[] = []
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
      : { added: 0, invalid: 0 }

    const fixedAlbums = albumsToFix.length
      ? await this.albumService.updateAlbums(albumsToFix)
      : []

    const deletedAlbums = dbFoldersMap.size
      ? await this.albumService.removeAlbums([...dbFoldersMap].map(([, next]) => next._id))
      : []

    return {
      ...addedAlbums,
      updated: fixedAlbums.length,
      deleted: deletedAlbums.length
    }
  }
}
