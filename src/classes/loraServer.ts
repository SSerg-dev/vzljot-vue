import BaseObject from './base/baseObject'

export const loraTypes = {
  actility: {
    name: 'Actility',
    url: 'https://dx-api.thingpark.io/core/latest/api'
  },
  vega: {
    name: 'Vega',
    url: ''
  },
  erTelecom: {
    name: 'ЭР-Телеком',
    url: 'https://ernet.ertelecom.ru/api'
  }
}

export class LoraServerError {
  name?: string
  operator?: string
  networkAddress?: string
  userName?: string

  constructor({ name, operator, networkAddress, userName }: { name?: string; operator?: string; networkAddress?: string; userName?: string }) {
    if (name) this.name = name
    if (operator) this.operator = operator
    if (networkAddress) this.networkAddress = networkAddress
    if (userName) this.userName = userName
  }
}

export interface ILoraServer {
  uuid?: string
  id?: number
  name?: string
  networkAddress?: string
  operator?: keyof typeof loraTypes
  userName?: string
  password?: string
  token?: string
  checked?: boolean
}

export class LoraServer extends BaseObject {
  image = 'fas fa-server icon'
  editable: boolean = LoraServer.store.state.user?.userRights.loRaServerEdit

  id?: number
  name: string
  networkAddress: string
  operator: keyof typeof loraTypes
  userName: string
  password: string
  token?: string
  checked?: boolean

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    operator = 'actility',
    networkAddress = loraTypes.actility.url,
    userName = '',
    password = '',
    token = ''
  }: ILoraServer) {
    super(uuid)

    this.id = id
    this.name = name
    this.operator = operator
    this.networkAddress = networkAddress
    this.userName = userName
    this.password = password
    this.token = token
  }

  validate(loraServers: Array<LoraServer> | undefined): LoraServerError {
    const error: LoraServerError = {}

    if (!this.name) {
      error.name = 'Наименование не может быть пустым.'
    } else if (loraServers !== undefined && loraServers.some(r => this.name === r.name && this.uuid !== r.uuid)) {
      error.name = 'Наименование должно быть уникальным.'
    }

    if (!this.operator) {
      error.operator = 'Необходимо выбрать тип оператора.'
    }

    if (!this.networkAddress) {
      error.networkAddress = 'Адрес cервера не может быть пустым.'
    }

    if (this.operator === 'vega' && !this.userName) {
      error.userName = 'Имя пользователя не может быть пустым.'
    }

    if (this.operator === 'vega' && !this.password) {
      error.userName = 'Пароль не может быть пустым.'
    }

    return error
  }
}
