const ALLOWED_PROXY_HOSTS = new Set(['downloader.disk.yandex.ru'])

const isPCloudHost = (hostname: string) => {
  const host = hostname.toLowerCase()
  return host === 'pcloud.com' || host.endsWith('.pcloud.com')
}

export const isAllowedProxyUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString)

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false
    }

    const hostname = url.hostname.toLowerCase()

    return isPCloudHost(hostname) || ALLOWED_PROXY_HOSTS.has(hostname)
  } catch {
    return false
  }
}
