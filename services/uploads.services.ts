import { Request } from "express"
import { Model } from "mongoose"

class UploadsServices {
  async upload<T extends Model<any>>(Model: T, req: Request) {
    if (req.file) {
      const $set: any = {}
      const setKey = req.file.fieldname

      $set[setKey] = `/uploads/${req.file.filename}`

      const response = await Model.findOneAndUpdate({
        _id: req.params['id']
      }, { $set }, { new: true })
      
      return response
    }
  }
}

export default new UploadsServices()
