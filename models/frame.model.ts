import 'module-alias/register'
import { model, Schema } from 'mongoose'
import { FrameModelDocument, FrameModelPaginated } from '~/types/Frame'
import mongoosePaginate from 'mongoose-paginate-v2'

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
FrameSchema.plugin(mongoosePaginate)

export const Frame = model<FrameModelDocument>('frames', FrameSchema) as FrameModelPaginated<FrameModelDocument>