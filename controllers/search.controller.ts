import 'module-alias/register'
import { Request, Response } from 'express'
import searchServices from '~/services/search.services'

export class SearchController {
  static async search(req: Request, res: Response, next: (error: unknown) => void) {
    const { query, key } = req.body

    try {
      const response = await searchServices.search({ query, key })
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

// const discogs = async (req: Request, res: Response) => {
//   const discogsUrl = `
//     type=release
//     &artist=${req.body.artist}
//     &release_title=${req.body.album}
//     &page=${req.body.page}
//     &sort=released
//     &per_page=100
//   `

//   try {
//     const discogsQuery = CloudLib.discogsQueryLink(discogsUrl)
//     const discogsResponse = await CloudLib.get(encodeURI(discogsQuery))

//     res.json(discogsResponse.data)
//   } catch (error) {
//     res.status(500).json(error)
//   }
// }
