import BaseObject from './base/baseObject'

export interface ISipAccountsProps {
  items: Array<SipAccount>
}

interface ISipAccountError {
  name?: string
  registrarServer?: string
  userName?: string
  authenticationName?: string
}

export class SipAccountError {
  name?: string
  registrarServer?: string
  userName?: string
  authenticationName?: string

  constructor({ name, registrarServer, userName, authenticationName }: ISipAccountError) {
    if (name) this.name = name
    if (registrarServer) this.registrarServer = registrarServer
    if (userName) this.userName = userName
    if (authenticationName) this.authenticationName = authenticationName
  }
}

export interface ISipAccount {
  uuid?: string
  id?: number
  name?: string
  registrarServer?: string
  proxyServer?: string
  stunServer?: string
  domain?: string
  userName?: string
  authenticationName?: string
  password?: string
  countThread?: number
  protocol?: number
  expires?: number
  checked?: boolean
}

export class SipAccount extends BaseObject {
  image = 'fas fa-phone-alt icon'
  editable: boolean = SipAccount.store.state.user?.userRights.sipAccountEdit

  id?: number | undefined
  name: string
  registrarServer: string
  proxyServer: string
  stunServer: string
  domain: string
  userName: string
  authenticationName: string
  password: string
  countThread: number
  protocol: number
  expires: number
  checked?: boolean

  constructor({ uuid = undefined, id = undefined, name = '', registrarServer = '', proxyServer = '', stunServer = '', domain = '', userName = '', authenticationName = '', password = '', countThread = 1, protocol = 1, expires = 180 }: ISipAccount) {
    super(uuid)

    this.id = id
    this.name = name
    this.registrarServer = registrarServer
    this.proxyServer = proxyServer
    this.stunServer = stunServer
    this.domain = domain
    this.userName = userName
    this.authenticationName = authenticationName
    this.password = password
    this.countThread = countThread
    this.protocol = protocol
    this.expires = expires
  }

  validate(sipAccounts: Array<SipAccount> | undefined): SipAccountError {
    const error = new SipAccountError({})

    if (!this.name) {
      error.name = 'Наименование не может быть пустым.'
    } else if (sipAccounts !== undefined && sipAccounts.some(r => this.name === r.name && this.uuid !== r.uuid)) {
      error.name = 'Наименование должно быть уникальным.'
    }

    if (!this.registrarServer) {
      error.registrarServer = 'SIP cервер не может быть пустым.'
    }

    if (!this.userName) {
      error.userName = 'Имя пользователя не может быть пустым.'
    }

    if (!this.authenticationName) {
      error.authenticationName = 'Имя регистрации не может быть пустым.'
    }

    return error
  }
}
