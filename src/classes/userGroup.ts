import BaseObject from './base/baseObject'

export class UserGroupError {
  name?: string

  constructor({ name = '' }: { name?: string }) {
    if (name) this.name = name
  }
}

type Right = {
  group: string
  description: string
  allow: boolean
  deny: boolean
  parent?: string
}

type Rights = {
  [key: string]: Right
}

export class UserGroup extends BaseObject {
  image = 'fas fa-users icon'

  id?: number
  name: string
  code: string
  rights?: Rights

  constructor({
    id = undefined,
    uuid = undefined,
    name = '',
    code = 'unknown',
    rights = undefined
  }: {
    id?: number
    uuid?: string
    name?: string
    code?: string
    rights?: Rights
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.code = code
    this.rights = rights
  }

  async init(id: number) {
    if (!Number.isNaN(id)) {
      const { data } = await this.http.get<UserGroup>('userGroup/group', { params: { id } })

      this.id = data.id
      this.name = data.name
      this.code = data.code
      this.rights = data.rights
    }
  }

  async save() {
    let userRights = null

    if (this.rights && Object.keys(this.rights) && this.rights.constructor === Object) {
      userRights = Object.entries(this.rights)
        .map(([k, v]) => ({
          key: k,
          allow: v.allow,
          deny: v.deny
        }))
        .filter(r => r.allow || r.deny)
        .map(r => ({
          key: r.key,
          value: r.allow
        }))
    }

    const { data } = await this.http.post('userGroup/group', { id: this.id, name: this.name, userRights })

    return data
  }
}
