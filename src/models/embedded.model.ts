import { model, Schema, PaginateModel, InferSchemaType, Types } from 'mongoose'
import { ArtistDocument } from './artist.model'
import { GenreDocument } from './genre.model'
import { PeriodDocument } from './period.model'
import { CollectionDocument } from './collection.model'
import paginate from 'mongoose-paginate-v2'

type EmbeddedObjectIdKeys = 'artist' | 'genre' | 'period' | 'inCollections'

const schema = new Schema({
	title: {
		type: String,
		required: true
	},
	artist: {
		type: Schema.Types.ObjectId,
		ref: 'artists',
		required: true
	},
	genre: {
		type: Schema.Types.ObjectId,
		ref: 'genres',
		required: true
	},
	period: {
		type: Schema.Types.ObjectId,
		ref: 'periods',
		required: true
	},
	dateCreated: {
		type: Date,
		default: Date.now
	},
	frame: {
		type: String,
		required: true
	},
	inCollections: [
		{
			type: Schema.Types.ObjectId,
			ref: 'collections',
			required: false
		}
	]
})

schema.index({ title: 'text' })
schema.plugin(paginate)

export interface EmbeddedDocument extends Omit<
	InferSchemaType<typeof schema> & { _id: Types.ObjectId },
	EmbeddedObjectIdKeys
> {
	artist: ArtistDocument
	genre: GenreDocument
	period: PeriodDocument
	inCollections: CollectionDocument
}

export const Embedded = model<EmbeddedDocument, PaginateModel<EmbeddedDocument>>('embedded', schema)
