export type PlayListCreatePayload = {
  title: string
  track: string
}

export type PlayListUpdatePayload = {
  _id: string
  inList: boolean
  track: string
  order: number
}