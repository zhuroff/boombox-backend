import { Router, Request, Response } from 'express'
import https from 'https'
import http from 'http'

const router = Router()

router.get('/proxy', (req: Request, res: Response): void => {
  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is required' })
      return
    }

    const protocol = url.startsWith('https') ? https : http
    const rangeHeader = req.headers.range

    const requestHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    if (rangeHeader) {
      requestHeaders['Range'] = rangeHeader
    }

    protocol.get(url, {
      headers: requestHeaders
    }, (proxyRes) => {
      if (proxyRes.statusCode && [301, 302, 307, 308].includes(proxyRes.statusCode)) {
        const redirectUrl = proxyRes.headers.location
        if (!redirectUrl) {
          res.status(500).json({ error: 'Redirect without location header' })
          return
        }
        
        const redirectProtocol = redirectUrl.startsWith('https') ? https : http
        
        redirectProtocol.get(redirectUrl, {
          headers: requestHeaders
        }, (finalRes) => {
          const statusCode = finalRes.statusCode || 200
          
          if (statusCode !== 200 && statusCode !== 206) {
            res.status(statusCode).json({ 
              error: 'Failed to fetch file after redirect',
              statusCode 
            })
            return
          }

          res.status(statusCode)

          if (finalRes.headers['content-type']) {
            res.set('Content-Type', finalRes.headers['content-type'])
          }
          if (finalRes.headers['content-length']) {
            res.set('Content-Length', finalRes.headers['content-length'])
          }
          if (finalRes.headers['content-range']) {
            res.set('Content-Range', finalRes.headers['content-range'])
          }
          if (finalRes.headers['accept-ranges']) {
            res.set('Accept-Ranges', finalRes.headers['accept-ranges'])
          }
          
          res.set('Cache-Control', 'public, max-age=31536000')
          res.set('Access-Control-Allow-Origin', '*')

          finalRes.pipe(res)
        }).on('error', () => {
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to follow redirect' })
          }
        })
        
        return
      }

      const statusCode = proxyRes.statusCode || 200

      if (statusCode !== 200 && statusCode !== 206) {
        res.status(statusCode).json({ 
          error: 'Failed to fetch file',
          statusCode 
        })
        return
      }

      res.status(statusCode)

      if (proxyRes.headers['content-type']) {
        res.set('Content-Type', proxyRes.headers['content-type'])
      }
      if (proxyRes.headers['content-length']) {
        res.set('Content-Length', proxyRes.headers['content-length'])
      }
      if (proxyRes.headers['content-range']) {
        res.set('Content-Range', proxyRes.headers['content-range'])
      }
      if (proxyRes.headers['accept-ranges']) {
        res.set('Accept-Ranges', proxyRes.headers['accept-ranges'])
      }
      
      res.set('Cache-Control', 'public, max-age=31536000')
      res.set('Access-Control-Allow-Origin', '*')

      proxyRes.pipe(res)
    }).on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to fetch file' })
      }
    })
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to proxy file' })
    }
  }
})

export default router
