import 'module-alias/register'
import { Request, Response } from 'express'
import { Artist } from '~/models/artist.model'
import { getCategories, getCategory, uploadCategoryFiles } from '~/helpers/category'

const list = async (req: Request, res: Response) => {
  try {
    const response = await getCategories(Artist, req)
    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const single = async (req: Request, res: Response) => {
  try {
    const response = await getCategory(Artist, req)
    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const upload = async (req: Request, res: Response) => {
  try {
    const response = await uploadCategoryFiles(Artist, req)
    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  list,
  single,
  upload
}

export default controller
