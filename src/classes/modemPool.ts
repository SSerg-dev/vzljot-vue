import BaseObject from './base/baseObject'
import { Modem } from './modem'

export interface IModemPoolError {
  name?: string
}

export class ModemPoolError {
  name?: string

  constructor({ name = '' }: IModemPoolError) {
    if (name) this.name = name
  }
}

export interface IModemPool {
  uuid?: string
  id?: number | undefined
  name?: string
  modems?: Array<Modem>
  checked?: boolean
}

export class ModemPool extends BaseObject {
  image = 'fas fa-brackets-square icon'
  editable = ModemPool.store.state.user?.userRights.modemPoolEdit

  id: number | undefined
  name: string
  modems: Array<Modem>
  checked?: boolean

  constructor({ uuid = undefined, id = undefined, name = '', modems = [] }: IModemPool) {
    super(uuid)

    this.id = id
    this.name = name
    this.modems = modems.map(r => new Modem(r))
  }

  validate(modemPools: Array<ModemPool> | undefined): IModemPoolError {
    const error: IModemPoolError = {}

    if (!this.name) {
      error.name = 'Наименование не может быть пустым.'
    } else if (modemPools !== undefined && modemPools.some(r => this.name.toLowerCase() === r.name.toLowerCase() && this.uuid !== r.uuid)) {
      error.name = 'Наименование должно быть уникальным.'
    }

    return error
  }
}
