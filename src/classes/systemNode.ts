import BaseObject from './base/baseObject'

import { LoraServer } from './loraServer'
import { Modem } from './modem'
import { ModemPool } from './modemPool'
import { RedirectEndPoint } from './redirectEndPoint'
import { RedirectEndPointProperties } from './redirectEndPointProperties'
import { SipAccount } from './sipAccount'

export class SystemNodeError {
  name?: string
  internalAddress?: string

  constructor({
    name = '',
    internalAddress = '',
  }: {
    name?: string
    internalAddress?: string
  }) {
    if (name) this.name = name
    if (internalAddress) this.internalAddress = internalAddress
  }
}

export type Group = {
  asev: number
  assvGprs: number
  assvGprsPowerSavingMode: number
  csd: number
  default: number
  ethernet: number
  gprs: number
  serial: number
  spd: number
}

export type Port = {
  name: string
  number: number
}

const defaultGroups: Group = {
  asev: 20000,
  assvGprs: 40000,
  assvGprsPowerSavingMode: 10000,
  csd: 10000,
  default: 60000,
  ethernet: 5000,
  gprs: 60000,
  serial: 3000,
  spd: 10000,
}

interface ISystemNode {
  id: number
  name?: string
  internalAddress: string
  applicationServicePort: number
  dataServicePort: number
  transportServicePort: number
  groups?: Group
  defaultGroups?: Group
  loraServers: Array<LoraServer>
  modems: Array<Modem>
  pools: Array<ModemPool>
  sipAccounts: Array<SipAccount>
  endPoints: Array<RedirectEndPoint>
  comPortSpeeds: Array<number>
  serialPort?: number
  serialPorts: Array<Port>
  redirectEndPointIdKnown?: number
  redirectEndPointIdUnknown?: number
  nextModemOnNoCarrierCsd: boolean
  countNextModemOnNoCarrierCsd: boolean
  limitTransitions: number
}

export class SystemNode extends BaseObject {
  image = 'fas fa-laptop icon'
  editable = SystemNode.store.state.user?.userRights.systemNodeEdit

  id: number | undefined
  name?: string
  internalAddress: string
  applicationServicePort: number
  dataServicePort: number
  transportServicePort: number
  groups?: Group
  defaultGroups: Group
  comPortSpeeds: Array<number>
  serialPort?: number
  serialPorts: Array<Port>
  loraServers: Array<LoraServer>
  modems: Array<Modem>
  pools: Array<ModemPool>
  sipAccounts: Array<SipAccount>
  endPoints: Array<RedirectEndPoint>
  redirectEndPointProperties: RedirectEndPointProperties
  nextModemOnNoCarrierCsd: boolean
  countNextModemOnNoCarrierCsd: boolean
  limitTransitions: number

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    internalAddress = '127.0.0.1',
    applicationServicePort = 5511,
    dataServicePort = 5512,
    transportServicePort = 5513,
    groups = defaultGroups,
    comPortSpeeds = [],
    serialPort = 0,
    serialPorts = [],
    loraServers = [],
    modems = [],
    pools = [],
    sipAccounts = [],
    endPoints = [],
    redirectEndPointIdKnown = undefined,
    redirectEndPointIdUnknown = undefined,
    nextModemOnNoCarrierCsd = false,
    countNextModemOnNoCarrierCsd = false,
    limitTransitions = 1,
  }: {
    uuid?: string
    id?: number
    name?: string
    internalAddress?: string
    applicationServicePort?: number
    dataServicePort?: number
    transportServicePort?: number
    groups?: Group
    comPortSpeeds?: Array<number>
    serialPort?: number
    serialPorts?: Array<Port>
    loraServers?: Array<LoraServer>
    modems?: Array<Modem>
    pools?: Array<ModemPool>
    sipAccounts?: Array<SipAccount>
    endPoints?: Array<RedirectEndPoint>
    redirectEndPointIdKnown?: number
    redirectEndPointIdUnknown?: number
    nextModemOnNoCarrierCsd?: boolean
    countNextModemOnNoCarrierCsd?: boolean
    limitTransitions?: number
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.internalAddress = internalAddress
    this.applicationServicePort = applicationServicePort
    this.dataServicePort = dataServicePort
    this.transportServicePort = transportServicePort
    this.groups = groups
    this.defaultGroups = defaultGroups
    this.comPortSpeeds = comPortSpeeds
    this.serialPort = serialPort
    this.serialPorts = serialPorts
    this.loraServers = loraServers
    this.modems = modems
    this.pools = pools
    this.sipAccounts = sipAccounts
    this.endPoints = endPoints
    this.nextModemOnNoCarrierCsd = nextModemOnNoCarrierCsd
    this.countNextModemOnNoCarrierCsd = countNextModemOnNoCarrierCsd
    this.limitTransitions = limitTransitions

    const known = this.endPoints.find((r) => r.id === redirectEndPointIdKnown)
    const unknown = this.endPoints.find(
      (r) => r.id === redirectEndPointIdUnknown
    )

    this.redirectEndPointProperties = new RedirectEndPointProperties({
      redirectEndPointIdKnown: known ? known.uuid : undefined,
      redirectEndPointIdUnknown: unknown ? unknown.uuid : undefined,
    })
  }

  async init(id: number): Promise<void> {
    const { data } = await this.http.get<ISystemNode>('systemNode/systemNode', {
      params: { id },
    })

    this.id = data.id
    this.name = data?.name ?? ''
    this.internalAddress = data.internalAddress
    this.applicationServicePort = data.applicationServicePort
    this.dataServicePort = data.dataServicePort
    this.transportServicePort = data.transportServicePort
    this.groups = data.groups
    this.loraServers = data.loraServers.map((r) => new LoraServer(r))
    this.modems = data.modems.map((r) => new Modem(r))
    this.pools = data.pools.map((r) => new ModemPool(r))
    this.sipAccounts = data.sipAccounts.map((r) => new SipAccount(r))
    this.comPortSpeeds = data.comPortSpeeds
    this.serialPort = data.serialPort
    this.serialPorts = data.serialPorts
    this.nextModemOnNoCarrierCsd = data.nextModemOnNoCarrierCsd
    this.countNextModemOnNoCarrierCsd = data.countNextModemOnNoCarrierCsd
    this.limitTransitions = data.limitTransitions

    if (SystemNode.store.state.user?.userRights.allowRedirectEndpoints) {
      this.endPoints = data.endPoints.map((r) => new RedirectEndPoint(r))

      const known = this.endPoints.find(
        (r) => r.id === data.redirectEndPointIdKnown
      )
      const unknown = this.endPoints.find(
        (r) => r.id === data.redirectEndPointIdUnknown
      )

      this.redirectEndPointProperties = new RedirectEndPointProperties({
        redirectEndPointIdKnown: known ? known.uuid : undefined,
        redirectEndPointIdUnknown: unknown ? unknown.uuid : undefined,
      })
    }
  }

  async save(): Promise<void> {
    function endPoint(endPoint: RedirectEndPoint) {
      return {
        id: endPoint.id,
        name: endPoint.name,
        host: endPoint.host,
        port: endPoint.port,
      }
    }

    function loraServer(loraServer: LoraServer) {
      return {
        id: loraServer.id,
        name: loraServer.name,
        operator: loraServer.operator,
        networkAddress: loraServer.networkAddress,
        userName: loraServer.userName,
        password: loraServer.password,
        token: loraServer.token,
      }
    }

    function modem(modem: Modem) {
      return {
        id: modem.id,
        name: modem.name,
        comPort: modem.comPort,
        comSpeeds: modem.comSpeeds?.join(';'),
        modemInitString: modem.modemInitString,
      }
    }

    function pool(pool: ModemPool) {
      return {
        id: pool.id,
        name: pool.name,
        modems: pool.modems.map(modem),
      }
    }

    function sipAccount(sipAccount: SipAccount) {
      return {
        id: sipAccount.id,
        name: sipAccount.name,
        registrarServer: sipAccount.registrarServer,
        proxyServer: sipAccount.proxyServer,
        stunServer: sipAccount.stunServer,
        domain: sipAccount.domain,
        userName: sipAccount.userName,
        authenticationName: sipAccount.authenticationName,
        password: sipAccount.password,
        countThread: sipAccount.countThread,
        protocol: sipAccount.protocol,
        expires: sipAccount.expires,
      }
    }

    if (!this.countNextModemOnNoCarrierCsd) { 
      this.limitTransitions = 0
    }
    if (this.countNextModemOnNoCarrierCsd && this.limitTransitions === 0) {
      this.limitTransitions = 1
    }

    const payload: { [key: string]: any } = {
      id: this.id,
      name: this.name,
      internalAddress: this.internalAddress,
      applicationServicePort: this.applicationServicePort,
      dataServicePort: this.dataServicePort,
      transportServicePort: this.transportServicePort,
      loraServers: this.loraServers.map(loraServer),
      modems: this.modems.map(modem),
      pools: this.pools.map(pool),
      sipAccounts: this.sipAccounts.map(sipAccount),
      redirectEndPoints: this.endPoints.map(endPoint),
      redirectKnown: this.endPoints.find(
        (r) =>
          r.uuid === this.redirectEndPointProperties.redirectEndPointIdKnown
      )?.name,
      redirectUnknown: this.endPoints.find(
        (r) =>
          r.uuid === this.redirectEndPointProperties.redirectEndPointIdUnknown
      )?.name,
      nextModemOnNoCarrierCsd: this.nextModemOnNoCarrierCsd,
      countNextModemOnNoCarrierCsd: this.countNextModemOnNoCarrierCsd,
      limitTransitions: this.limitTransitions,
    }

    if (this.groups) {
      const match: { [key: string]: number } = {
        asev: 8,
        assvGprs: 6,
        assvGprsPowerSavingMode: 7,
        csd: 4,
        default: 1,
        ethernet: 3,
        gprs: 5,
        serial: 2,
        spd: 9,
      }

      payload.groups = Object.entries(this.groups).map(([k, v]) => ({
        group: match[k],
        value: v,
      }))
    }

    await this.http.post<void>('systemNode/systemNode', payload)
  }

  removeLoraServers(uuids: Array<string>): void {
    this.loraServers = this.loraServers.filter((r) => !uuids.includes(r.uuid))
  }

  removeRedirectEndpoints(uuids: Array<string>): void {
    this.endPoints = this.endPoints.filter((r) => !uuids.includes(r.uuid))

    if (
      this.redirectEndPointProperties.redirectEndPointIdKnown !== undefined &&
      uuids.includes(this.redirectEndPointProperties.redirectEndPointIdKnown)
    )
      this.redirectEndPointProperties.redirectEndPointIdKnown = undefined
    if (
      this.redirectEndPointProperties.redirectEndPointIdUnknown !== undefined &&
      uuids.includes(this.redirectEndPointProperties.redirectEndPointIdUnknown)
    )
      this.redirectEndPointProperties.redirectEndPointIdUnknown = undefined
  }
}
