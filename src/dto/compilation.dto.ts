import { CompilationDocument, CompilationDocumentAlbum } from '../models/compilation.model'
import GatheringEntity from './gathering.dto'

export class CompilationDTO extends GatheringEntity {
  tracks: CompilationDocumentAlbum[]

  constructor(compilation: CompilationDocument) {
    super(compilation)
    this.tracks = compilation.tracks
  }
}
