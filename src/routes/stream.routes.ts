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

    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (proxyRes) => {
      if (proxyRes.statusCode && [301, 302, 307, 308].includes(proxyRes.statusCode)) {
        const redirectUrl = proxyRes.headers.location
        if (!redirectUrl) {
          res.status(500).json({ error: 'Redirect without location header' })
          return
        }
        
        const redirectProtocol = redirectUrl.startsWith('https') ? https : http
        
        redirectProtocol.get(redirectUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }, (finalRes) => {
          if (finalRes.statusCode !== 200) {
            res.status(finalRes.statusCode || 500).json({ 
              error: 'Failed to fetch file after redirect',
              statusCode: finalRes.statusCode 
            })
            return
          }

          if (finalRes.headers['content-type']) {
            res.set('Content-Type', finalRes.headers['content-type'])
          }
          if (finalRes.headers['content-length']) {
            res.set('Content-Length', finalRes.headers['content-length'])
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

      if (proxyRes.statusCode !== 200) {
        res.status(proxyRes.statusCode || 500).json({ 
          error: 'Failed to fetch file',
          statusCode: proxyRes.statusCode 
        })
        return
      }

      if (proxyRes.headers['content-type']) {
        res.set('Content-Type', proxyRes.headers['content-type'])
      }
      if (proxyRes.headers['content-length']) {
        res.set('Content-Length', proxyRes.headers['content-length'])
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
