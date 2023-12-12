import { PCloudApi } from './cloud.pcloud'
import { YandexCloudApi } from './cloud.yandex'
import { GoogleCloudApi } from './cloud.google'

type apiMap = typeof YandexCloudApi | typeof PCloudApi | typeof GoogleCloudApi

const apiMap: Map<string, apiMap> = new Map()

apiMap.set('YCLOUD', YandexCloudApi)
apiMap.set('PCLOUD', PCloudApi)
apiMap.set('GCLOUD', GoogleCloudApi)

export const cloudApiGetter = (key: string) => {
  const TargetApi = apiMap.get(key) || YandexCloudApi
  return new TargetApi(`${process.env['COLLECTION_ROOT']}/Collection`)
}
