import { Request } from 'express'
import { DeepPartial, TOYRepository } from '../types/toy'
import { ListRequestConfig, RelatedAlbumsReqFilter } from '../types/pagination'
import { getCloudApi } from '..'
import { CloudApi } from '../types/cloud'
import { AlbumDocument } from '../models/album.model'
import CloudEntityViewFactory from '../views/CloudEntityViewFactory'
import Parser from '../utils/Parser'

export default class TOYRepositoryContracts implements TOYRepository {
  async #randomAlbumsQueryAdapter(filter: RelatedAlbumsReqFilter, rootPath: string): Promise<DeepPartial<AlbumDocument>[]> {
    const { from } = filter
    const cloudApi = getCloudApi(String(process.env['TOY_CLOUD_URL']))

    switch(from) {
      case 'genres':
        return await this.#getRandomAlbumsByGenre(filter, cloudApi, rootPath)
      case 'years':
        return await this.#getRandomAlbumsByYear(filter, cloudApi, rootPath)
      default:
        throw new Error('Invalid filter')
    }
  }

  async #getRandomAlbumsByGenre(filter: RelatedAlbumsReqFilter, cloudApi: CloudApi, rootPath: string) {
    const { excluded, value } = filter
    const content = await cloudApi.getFolders({
      path: `${rootPath}/${encodeURIComponent(value)}`,
    })

    return (
      content.filter((album) => (
        !album.title.startsWith('-') && album.title !== String(excluded?.['year'])
      ))
      .map((album) => ({
        title: `TOY: ${album.title}`,
        artist: { title: 'Various Artists' },
        genre: { title: value },
        period: { title: album.title },
        path: `${rootPath}/${encodeURIComponent(value)}/${album.path}`
      }))
    )
  }

  async #getRandomAlbumsByYear(filter: RelatedAlbumsReqFilter, cloudApi: CloudApi, rootPath: string) {
    const { excluded, value } = filter
    const toyRoot = await this.getTOYList(rootPath)
    const toyRootFolders = toyRoot.filter((item) => (
      item.type === 'dir' && item.title !== excluded?.['genre']
    ))

    const albums = await Promise.all(toyRootFolders.map(async (item) => {
      const folders = await cloudApi.getFolders({
        path: `${rootPath}/${encodeURIComponent(String(item.path))}`,
      })

      return folders.map((folder) => ({
        ...folder,
        path: `${rootPath}/${encodeURIComponent(String(item.path))}/${folder.path}`,
        genre: item.title
      }))
    }))

    return (
      albums.flat()
      .filter((album) => (
        album.type === 'dir' && album.title === String(value)
      ))
      .map((album) => ({
        title: `TOY: ${album.title}`,
        artist: { title: 'Various Artists' },
        genre: { title: album.genre },
        period: { title: album.title },
        path: album.path
      }))
    )
  }

  async #fetchTOYMetadata(path: string, metadataFile?: ReturnType<typeof CloudEntityViewFactory.create>) {
    if (!metadataFile) return null

    const cloudApi = getCloudApi(String(process.env['TOY_CLOUD_URL']))
    const metadataURL = await cloudApi.getFile({
      path: `${path}/${metadataFile.path}`
    })
    
    const response = await fetch(String(metadataURL))
    const responseText = await response.text()
    return Parser.parseTOYMetadata(responseText.split('\r\n').slice(1))
  }

  async getTOYList(path: string) {
    const cloudApi = getCloudApi(String(process.env['TOY_CLOUD_URL']))
    const result = await cloudApi.getFolders({ path })
    return result.filter((item) => !item.mimeType)
  }

  async getTOYAlbum(path: string) {
    const cloudApi = getCloudApi(String(process.env['TOY_CLOUD_URL']))
    const result = await cloudApi.getFolderContent({ path })
    const coverURL = await cloudApi.getFile({
      path: `${path}/cover.webp`, 
      fileType: 'image'
    })

    const metadataFile = result.items.find((item) => item.mimeType === 'text/plain')
    const metadataContent = await this.#fetchTOYMetadata(path, metadataFile)

    return { result, coverURL, metadataContent }
  }

  async getTOYListRandom(queryConfig: ListRequestConfig) {
    if (!queryConfig || !queryConfig.filter || !queryConfig.path) {
      throw new Error('Query config is invalid')
    }

    const { path: rootPath, filter } = queryConfig
    return await this.#randomAlbumsQueryAdapter(filter, rootPath)
  }

  async getTOYContent(root: string, req: Request) {
    const { genre, year, folder } = req.params
    const { limit, offset, fileType } = req.query
    const path = encodeURIComponent(`/${root}/${genre}/${year}/${folder}`)
    const query = `limit=${limit}&offset=${offset}`
    const cloudApi = getCloudApi(String(process.env['TOY_CLOUD_URL']))
    const result = await cloudApi.getFolderContent({ path, query })
    const items = result.items.filter((item) => !!item.mimeType?.includes(String(fileType)))
    return await Promise.all(items.map(async (item) => {
      return await cloudApi.getFile({
        path: `${path}/${item.title}`
      })
    }))
  }
}
