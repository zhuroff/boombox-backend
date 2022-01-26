import { model, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { FrameModelDocument, FrameModelPaginated } from '~/types/Frame'

const FrameSchema: Schema<FrameModelDocument> = new Schema({
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

	iframe: {
		type: String,
		required: true
	}
})

FrameSchema.index({ title: 'text' })
FrameSchema.plugin(mongoosePaginate)

export const Album = model<FrameModelDocument>('frames', FrameSchema) as FrameModelPaginated<FrameModelDocument>