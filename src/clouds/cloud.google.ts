// import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Cloud } from '../types/Cloud';

export class GoogleCloudApi implements Cloud {
  #cloudRootPath: string

  constructor(cloudRootPath: string) {
    this.#cloudRootPath = cloudRootPath
  }

  async getFolders(path: string) {
    return Promise.resolve(null)
  }

  async getFolderContent(path: string) {

  }

  async getFile(path: string) {
    console.log(this.#cloudRootPath)
  }
}
