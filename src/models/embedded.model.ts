import { model, Schema, PaginateModel } from 'mongoose'
import { EmbeddedDocument } from '../types/Embedded'
import paginate from 'mongoose-paginate-v2'

const EmbeddedSchema = new Schema({
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

EmbeddedSchema.index({ title: 'text' })
EmbeddedSchema.plugin(paginate)
export const Embedded = model<EmbeddedDocument, PaginateModel<EmbeddedDocument>>('frames', EmbeddedSchema)
