import BaseObject from './base/baseObject'

export class ModemError {
  port?: string
  speed?: string
  name?: string

  constructor({ port, speed, name }: { port?: string; speed?: string; name?: string }) {
    if (port) this.port = port
    if (speed) this.speed = speed
    if (name) this.name = name
  }
}

export interface IModem {
  uuid?: string
  id?: number
  name?: string
  comPort?: number
  comSpeeds?: Array<number>
  checked?: boolean
  modemInitString?: string
}

export class Modem extends BaseObject {
  image = 'fas fa-phone-alt icon'
  editable: boolean = Modem.store.state.user?.userRights.modemPoolEdit

  id: number | undefined
  name: string
  comPort: number
  comSpeeds?: Array<number>
  checked?: boolean
  modemInitString: string

  constructor({ uuid = undefined, id = undefined, name = '', comPort = 0, comSpeeds = undefined, modemInitString = '' }: IModem) {
    super(uuid)

    this.id = id
    this.name = name
    this.comPort = comPort
    this.comSpeeds = comSpeeds
    this.modemInitString = modemInitString
  }

  validate(modems: Array<Modem> | undefined): ModemError {
    const error = new ModemError({})

    if (!this.name) {
      error.name = 'Наименование не может быть пустым.'
    } else if (modems !== undefined && modems.some(r => this.name.toLowerCase() === r.name.toLowerCase() && this.uuid !== r.uuid)) {
      error.name = 'Наименование должно быть уникальным.'
    }

    if (!this.comPort) {
      error.port = 'Не задан порт.'
    } else {
      if (modems !== undefined && modems.some(r => this.comPort === r.comPort && this.uuid !== r.uuid)) {
        error.port = 'Модем с указанным портом уже существует.'
      }
    }

    if (this.comSpeeds !== undefined && this.comSpeeds.length === 0) {
      error.speed = 'Необходимо выбрать хотя бы одну скорость обмена.'
    }

    return error
  }
}
