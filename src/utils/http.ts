export type HttpRequestConfig = {
  headers?: Record<string, string>
}

export type HttpResponse<T> = {
  data: T
  url: string
  status: number
}

export class HttpError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(`Request failed with status ${status}`)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

const parseResponseBody = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()

  if (!text) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return JSON.parse(text) as T
  }

  return text as unknown as T
}

export class HttpClient {
  #defaultHeaders: Record<string, string>

  constructor(defaultHeaders: Record<string, string> = {}) {
    this.#defaultHeaders = defaultHeaders
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.#defaultHeaders,
        ...config?.headers
      }
    })

    const data = await parseResponseBody<T>(response)

    if (!response.ok) {
      throw new HttpError(response.status, data)
    }

    return {
      data,
      url: response.url,
      status: response.status
    }
  }
}

export const httpGet = <T>(url: string, config?: HttpRequestConfig) => {
  return new HttpClient().get<T>(url, config)
}
