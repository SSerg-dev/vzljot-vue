import { axios } from '@/plugins/axios'
import { store } from '@/store/store'
import { v4 as uuidv4 } from 'uuid'

export default class BaseObject {
  static store = store

  http: typeof axios
  uuid: string

  constructor(uuid = uuidv4()) {
    this.http = axios
    this.uuid = uuid
  }

  static matchType: any = (types: any) => {
    const obj: any = {}
    if (types) {
      Object.keys(types).map(key => {
        obj[types[key].type] = parseInt(key)
      })
    }
    return obj
  }
}
