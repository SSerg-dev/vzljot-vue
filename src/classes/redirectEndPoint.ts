import BaseObject from './base/baseObject'

export class RedirectEndPointError {
  name?: string
  host?: string

  constructor({ name, host }: { name?: string; host?: string }) {
    if (name) this.name = name
    if (host) this.host = host
  }
}

export interface IRedirectEndPoint {
  uuid?: string
  id?: number
  name?: string
  host?: string
  port?: number
  checked?: boolean
}

export class RedirectEndPoint extends BaseObject {
  image = 'fas fa-phone-alt icon'
  editable: boolean = RedirectEndPoint.store.state.user?.userRights.redirectEndpointEdit

  id?: number
  name: string
  host: string
  port: number
  checked?: boolean

  constructor({ uuid = undefined, id = undefined, name = '', host = '', port = 0 }: IRedirectEndPoint) {
    super(uuid)

    this.id = id
    this.name = name
    this.host = host
    this.port = port
  }

  validate(redirectEndPoints: Array<RedirectEndPoint> | undefined): RedirectEndPointError {
    const error = new RedirectEndPointError({})

    if (!this.name) {
      error.name = 'Наименование не может быть пустым.'
    } else if (redirectEndPoints !== undefined && redirectEndPoints.some(r => this.name === r.name && this.uuid !== r.uuid)) {
      error.name = 'Наименование должно быть уникальным.'
    }

    if (!this.host) {
      error.host = 'Сетевой адрес не может быть пустым.'
    }

    return error
  }
}
