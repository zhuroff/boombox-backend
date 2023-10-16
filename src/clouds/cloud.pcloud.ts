import utils from '../utils'
import { CloudExternalApi } from './cloud.external';
import { CloudEntityDTO } from '../dtos/cloud.dto';
import { CloudAPI, PCloudEntity, PCloudResponse } from '../types/Cloud'

export class PCloudApi extends CloudExternalApi implements CloudAPI {
  #domain = process.env['PCLOUD_DOMAIN']
  #login = process.env['PCLOUD_LOGIN']
  #password = process.env['PCLOUD_PASSWORD']
  #digest = ''

  constructor() {
    super()
  }

  async #getDigest() {
    return this.client
      .get(`${this.#domain}/getdigest`)
      .then(({ data }) => data.digest)
      .catch((error) => console.info(error))
  }

  #qBuilder(path: string) {
    return (`
      ${this.#domain}/
      ${path}
      &username=${this.#login}
      &digest=${this.#digest}
      &passworddigest=${utils.sha1(this.#password + utils.sha1(this.#login) + this.#digest)}
    `).replace(/\s{2,}/g, '')
  }

  async getFolders(path: string) {
    this.#digest = await this.#getDigest()
    return await this.client
      .get<PCloudResponse<PCloudEntity>>(this.#qBuilder(`listfolder?path=/${path}`))
      .then(({ data }) => data.metadata.contents.map((item) => new CloudEntityDTO(item)))
      .catch((error) => console.info(error))
  }

  async getFolderContent(path: string) {
    return await this.client
      .get<PCloudResponse<PCloudEntity>>(this.#qBuilder(`listfolder?path=/${path}`))
      .then(({ data }) => (
        data.metadata.contents.map((item) => new CloudEntityDTO(item))
      ))
      .catch((error) => console.info(error))
  }

  async getFile(path: string) {
    return await this.client
      .get<PCloudResponse<PCloudEntity>>(`${this.#domain}${path}`)
      .then(({ data }) => data.file)
      .catch((error) => console.info('getFile', error.message))
  }
}
