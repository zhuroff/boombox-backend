import { PCloudApi } from './cloud.pcloud'
import { YandexCloudApi } from './cloud.yandex'

type apiMap = typeof YandexCloudApi | typeof PCloudApi

const apiMap: Map<string, apiMap> = new Map()

apiMap.set('YCLOUD', YandexCloudApi)
apiMap.set('PCLOUD', PCloudApi)

export const cloudApiGetter = (key: string) => {
  const TargetApi = apiMap.get(key) || YandexCloudApi
  return new TargetApi()
}
