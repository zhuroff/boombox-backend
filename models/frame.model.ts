import 'module-alias/register'
import { model, Schema, PaginateModel } from 'mongoose'
import { FrameDocument } from '~/types/Frame'
import paginate from 'mongoose-paginate-v2'

const FrameSchema = new Schema({
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

FrameSchema.index({ title: 'text' })
FrameSchema.plugin(paginate)
export const Frame = model<FrameDocument, PaginateModel<FrameDocument>>('frames', FrameSchema)
