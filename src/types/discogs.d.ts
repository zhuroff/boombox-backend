export interface DiscogsPayload {
  artist: string
  album: string
  page: number
  isMasterOnly?: boolean
}

export interface DiscogsCollectionItem {
  id: number
  date_added: string
  instance_id: number
  rating: number
  basic_information: {
    id: number
    year: number
    thumb: string
    title: string
    cover_image: string
    master_id: number
    master_url: string
    resource_url: string
    styles: string[]
    genres: string[]
    artists: {
      id: number
      name: string
      join: string
      anv: string
      resource_url: string
      role: string
    }[]
    formats: {
      qty: string
      name: string
      description: string[]    
    },
    labels: {
      id: number
      name: string
      catno: string
      resource_url: string
    }[]
  }
}

export interface DiscogsResponseItem {
  barcode: string[]
  catno: string
  country: string
  cover_image: string
  format: string[]
  genre: string[]
  id: number
  label: string[]
  master_url: string
  resource_url: string
  uri: string
  style: string[]
  title: string
  year: string
  type: string
  master_id: number
  thumb: string
  format_quantity: number
  community: { want: number; have: number }
}

export interface DiscogsReleaseItem {
  id: number
  date_added: string
  basic_information: {}
  notes: { field_id: number, value: string }[]
}

export interface DiscogsResponsePagination {
  items: number
  page: number
  pages: number
  per_page: number
}

export interface DiscogsSearchResponse {
  pagination?: DiscogsResponsePagination
  results: DiscogsResponseItem[]
}

export interface DiscogsReleasesResponse {
  pagination?: DiscogsResponsePagination
  releases: DiscogsReleaseItem[]
}

export interface DiscogsFolderItem {
  id: number
  name: string
  count: number
  resource_url: string
}

export interface DiscogsCollectionItem {
  name: string
  count: number
  releases: DiscogsSearchResponse
}

export interface DiscogsFoldersResponse {
  folders: DiscogsFolderItem[]
}

export interface DiscogsRepository {
  getCollectionFolders(query: string, folderName?: string): Promise<DiscogsFolderItem[]>
  getCollectionContent(query: string): Promise<DiscogsReleasesResponse | null>
  getDiscogsList(query: string): Promise<DiscogsSearchResponse | null>
}
