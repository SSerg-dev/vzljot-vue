import BaseObject from './base/baseObject'
import { store } from '@/store/store'

const password = '     '
const FULL_ADDRESS_TYPE = 17

export default class User extends BaseObject {
  constructor(obj) {
    super()

    this.id = obj && obj.id ? obj.id : null

    this.name = obj && obj.name ? obj.name : null

    this.domain =
      obj && Object.prototype.hasOwnProperty.call(obj, 'domain')
        ? obj.domain
        : null

    this.hasPassword =
      obj && Object.prototype.hasOwnProperty.call(obj, 'hasPassword')
        ? obj.hasPassword
        : false

    this.password =
      obj && Object.prototype.hasOwnProperty.call(obj, 'password')
        ? obj.password
        : this.hasPassword
        ? password
        : ''

    this.enabled =
      obj && Object.prototype.hasOwnProperty.call(obj, 'enabled')
        ? obj.enabled
        : true

    this.groups =
      obj && Object.prototype.hasOwnProperty.call(obj, 'groups')
        ? obj.groups
        : User.store.state.env.userGroups

    this.userGroups =
      obj && Object.prototype.hasOwnProperty.call(obj, 'userGroups')
        ? this.groups
            .filter((r) => obj.userGroups.includes(r.id))
            .map((r) => r.id)
        : this.groups.filter((r) => r.typeCode === 'user').map((r) => r.id)

    this.desc =
      obj && Object.prototype.hasOwnProperty.call(obj, 'desc') ? obj.desc : null

    this.limitEquips =
      obj && Object.prototype.hasOwnProperty.call(obj, 'limitEquips')
        ? obj.limitEquips
        : false

    this.limitPoints =
      obj && Object.prototype.hasOwnProperty.call(obj, 'limitPoints')
        ? obj.limitPoints
        : false

    this.limitReports =
      obj && Object.prototype.hasOwnProperty.call(obj, 'limitReports')
        ? obj.limitReports
        : false

    this.includeRelatedEquips =
      obj && Object.prototype.hasOwnProperty.call(obj, 'includeRelatedEquips')
        ? obj.includeRelatedEquips
        : false

    this.includeRelatedPoints =
      obj && Object.prototype.hasOwnProperty.call(obj, 'includeRelatedPoints')
        ? obj.includeRelatedPoints
        : false

    this.map =
      obj && obj.map
        ? obj.map
        : {
            id: 0,
            connection: null,
          }

    this.notification =
      obj && obj.notification
        ? obj.notification
        : Object.assign(
            {
              sound: false,
            },
            ...Object.keys(User.store.state.env.notificationPriorityEnum)
              .filter((r) => r !== 'none')
              .map((r) => {
                return {
                  [r]: {
                    email: false,
                    fromHour: 0,
                    fromMinutes: 0,
                    toHour: 23,
                    toMinutes: 59,
                  },
                }
              })
          )

    const defaultDepth = 33
    const timeFrom = new Date(Date.now())
    timeFrom.setDate(timeFrom.getDate() - defaultDepth)

    this.view =
      obj && obj.view
        ? obj.view
        : {
            system: {
              value: true,
              visible: true,
            },
            timeType: User.matchType(User.store.state.env.pollDataTimeTypes)
              .onDepth,
            timeDepth: defaultDepth,
            timeFrom: timeFrom,
            isTimeTo: false,
            timeTo: new Date(Date.now()),
            useWebSystem: {
              value: true,
              visible: true,
            },
            info: true,
            points: true,
            equips: true,
            extra: true,
            map: true,
          }

    this.contactEmail = obj ? obj.contactEmail : null
    this.contactPhone = obj ? obj.contactPhone : null
    this.contactUseSystem = obj ? obj.contactUseSystem : true
    this.contactMaxFilesCount = obj ? obj.contactMaxFilesCount : 30
    this.contactMaxFilesSize = obj ? obj.contactMaxFilesSize : 10

    this.systemNodeUseSystem = obj ? obj.systemNodeUseSystem : true
    this.serverSystemNodes = obj ? obj.serverSystemNodes : []

    this.serverSystemNodesSelectedList = obj
      ? obj.serverSystemNodesSelectedList
      : []

    this.notificationServers =
      obj && obj.notificationSystemNodeSelectedList
        ? this.getFullNotificationServers(
            obj.notificationSystemNodeSelectedList
          )
        : []

    this.notificationAddresses =
      obj && obj.notificationAddressSelectedList
        ? this.getFullNotificationAddresses(obj.notificationAddressSelectedList)
        : []

    this.addresses = obj && obj.addresses ? obj.addresses : []
    this.systemNode = obj ? obj.systemNode : null
    this.systemNodes = obj ? obj.systemNodes : []
    this.equips = obj && obj.equips ? obj.equips : []
    this.equipLists = obj && obj.equipLists ? obj.equipLists : []

    this.points = obj && obj.points ? obj.points : []
    this.pointGroups = obj && obj.pointGroups ? obj.pointGroups : []
    this.pointLists = obj && obj.pointLists ? obj.pointLists : []

    this.balanceGroups = []
    this.nodes = obj && obj.nodes ? obj.nodes : []
    this.reports = obj && obj.reports ? obj.reports : []

    if (obj && obj.balanceGroups) {
      obj.balanceGroups.forEach((r) => {
        if (r.groups & 3) {
          if (r.groups === 1 || r.groups === 3) {
            this.balanceGroups.push({
              id: r.id,
              type: r.type,
              name: r.name + ' (Источники)',
              groups: 1,
              state: r.state,
              checked: false,
            })
          }
          if (r.groups === 2 || r.groups === 3) {
            this.balanceGroups.push({
              id: r.id,
              type: r.type,
              name: r.name + ' (Потребители)',
              groups: 2,
              state: r.state,
              checked: false,
            })
          }
        }
      })
    }
  }

  async getFullNotificationServers(ids) {
    let { data } = await this.http.get('user/systemNodeList')
    const result = [...data.filter((r) => ids.includes(r.id))]

    return result
  }

  async getFullNotificationAddresses(ids) {
    let { data } = await this.http.get('address/addresses')
    let result = [...data.filter((r) => ids.includes(r.id))]
    result = result.map((r) => ({
      ...r,
      type: FULL_ADDRESS_TYPE,
      systemType: 2,
      state: -1,
    }))

    return result
  }

  async save(userRights, subscriptions) {
    const balanceGroups = {}
    this.balanceGroups.forEach((r) => {
      if (Object.prototype.hasOwnProperty.call(balanceGroups, r.id)) {
        balanceGroups[r.id] += r.groups
      } else {
        balanceGroups[r.id] = r.groups
      }
    })

    let obj = {
      id: this.id,
      name: this.name,
      password: this.password.trim(),
      domain: this.domain,
      savePassword: this.password !== password,
      desc: this.desc,
      enabled: this.enabled,
      systemNodeUseSystem: this.systemNodeUseSystem,
      serverSystemNodes: this.serverSystemNodes,
      serverSystemNodesSelected: [],
      limitEquips: this.limitEquips,
      limitPoints: this.limitPoints,
      limitReports: this.limitReports,
      includeRelatedEquips: this.includeRelatedEquips,
      includeRelatedPoints: this.includeRelatedPoints,
      userGroups: this.userGroups,
      equips: this.equips.map((r) => r.id),
      equipLists: this.equipLists.map((r) => r.id),
      serverSystemNodesSelectedList: this.serverSystemNodesSelectedList.map(
        (r) => ({ id: r.id, name: r.name })
      ),
      notificationServers: store.state.equip.notificationServers.map(
        (r) => r.id
      ),
      notificationAddresses: store.state.equip.notificationAddresses.map(
        (r) => r.id
      ),
      notificationIndex: store.state.equip.notificationIndex,

      addresses: this.addresses.map((r) => r.id),
      points: this.points.map((r) => r.id),
      pointLists: this.pointLists.map((r) => r.id),
      pointGroups: this.pointGroups.map((r) => r.id),
      nodes: this.nodes.map((r) => r.id),
      reports: this.reports.map((r) => r.id),
      balanceGroups: Object.entries(balanceGroups).map(([key, value]) => ({
        id: parseInt(key),
        value,
      })),
      notification: {
        sound: this.notification.sound,
      },
      gis:
        this.map.id === null
          ? null
          : {
              map: this.map.id,
              connection: this.map.connection,
            },
      view: {
        useSystem: this.view.system.visible ? this.view.system.value : null,
        timeType: this.view.timeType,
        timeDepth:
          User.matchType(User.store.state.env.pollDataTimeTypes).onDepth ===
          this.view.timeType
            ? this.view.timeDepth
            : null,
        timeFrom:
          User.matchType(User.store.state.env.pollDataTimeTypes).fromTime ===
          this.view.timeType
            ? new Date(this.view.timeFrom).getTime()
            : null,
        timeTo:
          User.matchType(User.store.state.env.pollDataTimeTypes).fromTime ===
          this.view.timeType
            ? this.view.isTimeTo
              ? new Date(this.view.timeTo).getTime()
              : null
            : null,
        useWebSystem: this.view.useWebSystem.visible
          ? this.view.useWebSystem.value
          : null,
        info: this.view.info,
        points: this.view.points,
        equips: this.view.equips,
        extra: this.view.extra,
        map: this.view.map,
      },
      mailing: {
        phone: this.contactPhone,
        email: this.contactEmail,
        useSystem: this.contactUseSystem,
        maxFilesCount: this.contactMaxFilesCount,
        maxFilesSize: this.contactMaxFilesSize,
      },
    }
    if (
      Array.isArray(store.state.equip.serverSystemNodesSelected) &&
      store.state.equip.serverSystemNodesSelected.length > 0
    ) {
      obj.serverSystemNodesSelected =
        store.state.equip.serverSystemNodesSelected
    } else {
      obj.serverSystemNodesSelected = []
    }

    if (!this.systemNodeUseSystem) {
      obj.systemNode = this.systemNode
    }

    if (
      userRights &&
      Object.keys(userRights) &&
      userRights.constructor === Object
    ) {
      obj.userRights = Object.entries(userRights)
        .map(([k, v]) => ({
          key: k,
          allow: v.allow,
          deny: v.deny,
        }))
        .filter((r) => r.allow || r.deny)
        .map((r) => ({
          key: r.key,
          value: r.allow,
        }))
    }

    if (subscriptions && subscriptions.constructor === Array) {
      const getCircularReplacer = () => {
        const seen = new WeakSet()
        return (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return
            }
            seen.add(value)
          }
          return value
        }
      }

      obj.subscriptions = JSON.parse(
        JSON.stringify(subscriptions, getCircularReplacer())
      )

      obj.subscriptions.forEach((r) => {
        const bg = {}

        r.balanceGroups.forEach((x) => {
          if (Object.prototype.hasOwnProperty.call(bg, x.id)) {
            bg[x.id] += x.groups
          } else {
            bg[x.id] = x.groups
          }
        })
        r.equips = r.equips.map((x) => x.id)
        r.equipLists = r.equipLists.map((x) => x.id)
        r.points = r.points.map((x) => x.id)
        r.pointLists = r.pointLists.map((x) => x.id)
        r.pointGroups = r.pointGroups.map((x) => x.id)
        r.balanceGroups = Object.entries(bg).map(([key, value]) => ({
          id: parseInt(key),
          value,
        }))
        r.nodes = r.nodes.map((x) => x.id)
        r.events = Object.entries(r.events).map(([key, value]) => ({
          messageType: key,
          source: value.source,
          selected:
            Array.isArray(value.selected) && value.selected.length === 0
              ? null
              : JSON.stringify(value.selected),
        }))
      })
    }

    Object.keys(User.store.state.env.notificationPriorityEnum)
      .filter((r) => r !== 'none')
      .forEach((r) => {
        obj[`${r}Priority`] = this.notification[r]
      })

    const { data, status } = await this.http.post('user/user', obj)

    if (status && status === 200) {
      store.state.equip.serverSystemNodesSelected = []
      store.state.equip.serverSystemNodesSelectedList = []
      store.state.equip.equipEvent.hasChangeSystemNode = false
      store.state.equip.notificationServers = []
      store.state.equip.notificationAddresses = []
    }

    return data
  }

  async testEmail() {
    return await this.http.get('user/testEmail', {
      params: { email: this.contactEmail },
    })
  }

  async testSms() {
    return await this.http.get('user/testSms', {
      params: { phone: this.contactPhone },
    })
  }
}
