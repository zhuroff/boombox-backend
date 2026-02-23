import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import { CategoryDocument } from '../types/category'
import { AlbumItem } from '../types/album'
import EntityBasicView from '../views/BasicEntityView'
import AlbumViewFactory from '../views/AlbumViewFactory'

class CategoryItemView extends EntityBasicView {
  albums: number
  avatar?: string | null
  kind = 'category'

  constructor(
    _id: Types.ObjectId,
    title: string,
    albums: AlbumDocument[],
    avatar?: string | null
  ) {
    super(_id, title)
    this.albums = albums.length
    this.avatar = avatar
  }
}

class CategoryPageView extends EntityBasicView {
  poster?: string | null
  avatar?: string | null
  albums: AlbumItem[]

  constructor(
    _id: Types.ObjectId,
    title: string,
    albums: AlbumItem[],
    poster?: string | null,
    avatar?: string | null
  ) {
    super(_id, title)
    this.poster = poster
    this.avatar = avatar
    this.albums = albums
  }
}

export default class CategoryViewFactory {
  static createCategoryItemView(category: CategoryDocument) {
    return new CategoryItemView(
      category._id,
      category.title,
      category.albums,
      category.avatar
    )
  }

  static createCategoryPageView(category: CategoryDocument) {
    return new CategoryPageView(
      category._id,
      category.title,
      category.albums.map((album) => AlbumViewFactory.createAlbumItemView(album)),
      category.poster,
      category.avatar
    )
  }
}
