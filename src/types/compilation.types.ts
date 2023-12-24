export type CompilationCreatePayload = {
  title: string
  track: string
}

export type CompilationUpdatePayload = {
  _id: string
  inList: boolean
  track: string
  order: number
}