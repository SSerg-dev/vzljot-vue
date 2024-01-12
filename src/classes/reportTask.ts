import BaseObject from './base/baseObject'

export class ReportTaskError {
  name?: string
  timeStart?: string
  timeEnd?: string
  mailingSubject?: string

  constructor({ name = '', timeStart = '', timeEnd = '', mailingSubject = '' }) {
    if (name) this.name = name
    if (timeStart) this.timeStart = timeStart
    if (timeEnd) this.timeEnd = timeEnd
    if (mailingSubject) this.mailingSubject = mailingSubject
  }
}

type Measures = {
  [key: string]: number
}

type Equip = {
  checked?: boolean
  id: number
  type: number
  name: string
  // connectionGroupType: number
  state: number
}

type EquipList = {
  checked?: boolean
  id: number
  type: number
  name: string
  state: number
}

type Point = {
  checked?: boolean
  id: number
  type: number
  name: string
  // systemType: number
  state: number
}

type PointList = {
  checked?: boolean
  id: number
  type: number
  name: string
  state: number
}

type User = {
  checked?: boolean
  id: number
  type: number
  name: string
  desc: string
}

type ReportTaskType = {
  uuid?: string
  id?: number
  name?: string
  active?: boolean
  timeStart?: Date
  timeEnd?: Date | null
  archiveType?: number
  periodType?: number
  contractDay?: number
  contractMonth?: number
  contractHours?: number
  contractMinutes?: number
  runType?: number
  runDataWait?: boolean
  runDataHours?: number
  runDataMinutes?: number
  runPeriod?: number
  runMonth?: number
  runDay?: number
  runHours?: number
  runMinutes?: number
  winter?: boolean
  summer?: boolean
  timeType?: number
  idle?: boolean
  addEmptyRows?: boolean
  sourceEquip?: number
  sourcePoint?: number
  isMailingEnabled?: boolean
  mailingSubject?: string
  mailingFileFormat?: number
  mailingAllowZip?: boolean
  measures?: Measures
  equips?: Array<Equip>
  equipLists?: Array<EquipList>
  points?: Array<Point>
  pointLists?: Array<PointList>
  users?: Array<User>
}

export class ReportTask extends BaseObject {
  image = 'fas fa-file-alt icon'
  editable = ReportTask.store.state.user?.userRights.reportTaskEdit

  id?: number
  name: string
  active: boolean
  timeStart: Date
  timeEnd: Date | null
  archiveType: number
  periodType: number
  contractDay: number
  contractMonth: number
  contractHours: number
  contractMinutes: number
  runType: number
  runDataWait: boolean
  runDataHours: number
  runDataMinutes: number
  runPeriod: number
  runMonth: number
  runDay: number
  runHours: number
  runMinutes: number
  winter: boolean
  summer: boolean
  timeType: number
  idle: boolean
  addEmptyRows: boolean
  sourceEquip: number
  sourcePoint: number
  isMailingEnabled: boolean
  mailingSubject: string
  mailingFileFormat: number
  mailingAllowZip: boolean
  measures: Measures
  equips: Array<Equip>
  equipLists: Array<EquipList>
  points: Array<Point>
  pointLists: Array<PointList>
  users: Array<User>

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    active = true,
    timeStart = new Date(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth(), 1, 0, 0, 0),
    timeEnd = null,
    archiveType = ReportTask.matchType(ReportTask.store.state.env.archiveTypes).day,
    periodType = ReportTask.store.state.env.reportPeriodTypes.reporting.type,
    contractDay = 1,
    contractMonth = 1,
    contractHours = 0,
    contractMinutes = 0,
    runType = ReportTask.matchType(ReportTask.store.state.env.reportTaskRunTypes).byData,
    runDataWait = false,
    runDataHours = 8,
    runDataMinutes = 0,
    runPeriod = ReportTask.matchType(ReportTask.store.state.env.reportTaskRunPeriod).afterReportEndTime,
    runMonth = 1,
    runDay = 1,
    runHours = 8,
    runMinutes = 0,
    winter = true,
    summer = false,
    timeType = 3,
    idle = false,
    addEmptyRows = true,
    sourceEquip = ReportTask.matchType(ReportTask.store.state.env.reportTaskSourceEquip).none,
    sourcePoint = ReportTask.matchType(ReportTask.store.state.env.reportTaskSourcePoint).none,
    isMailingEnabled = false,
    mailingSubject = 'Рассылка отчетов',
    mailingFileFormat = ReportTask.matchType(ReportTask.store.state.env.exportFileFormats).pdf,
    mailingAllowZip = false,
    measures = {},
    equips = [],
    equipLists = [],
    points = [],
    pointLists = [],
    users = []
  }: ReportTaskType) {
    super(uuid)

    this.id = id
    this.name = name
    this.active = active
    this.timeStart = timeStart
    this.timeEnd = timeEnd
    this.archiveType = archiveType
    this.periodType = periodType
    this.contractDay = contractDay
    this.contractMonth = contractMonth
    this.contractHours = contractHours
    this.contractMinutes = contractMinutes
    this.runType = runType
    this.runDataWait = runDataWait
    this.runDataHours = runDataHours
    this.runDataMinutes = runDataMinutes
    this.runPeriod = runPeriod
    this.runMonth = runMonth
    this.runDay = runDay
    this.runHours = runHours
    this.runMinutes = runMinutes
    this.winter = winter
    this.summer = summer
    this.timeType = timeType
    this.idle = idle
    this.addEmptyRows = addEmptyRows
    this.sourceEquip = sourceEquip
    this.sourcePoint = sourcePoint
    this.isMailingEnabled = isMailingEnabled
    this.mailingSubject = mailingSubject
    this.mailingFileFormat = mailingFileFormat
    this.mailingAllowZip = mailingAllowZip
    this.measures = measures
    this.equips = equips
    this.equipLists = equipLists
    this.points = points
    this.pointLists = pointLists
    this.users = users
  }

  async init(id: number): Promise<void> {
    const { data } = await this.http.get('reportTask/task', { params: { id } })

    this.id = data.id
    this.name = data.name
    this.active = data.active
    this.timeStart = data.timeStart
    this.timeEnd = data.timeEnd
    this.winter = data.winter
    this.summer = data.summer
    this.archiveType = data.archiveType
    this.periodType = data.periodType
    this.contractMonth = data.contractMonth
    this.contractDay = data.contractDay
    this.contractHours = data.contractHours
    this.contractMinutes = data.contractMinutes
    this.runType = data.runType
    this.runDataWait = data.runDataWait
    this.runDataHours = data.runDataHours
    this.runDataMinutes = data.runDataMinutes
    this.runPeriod = data.runPeriod
    this.runMonth = data.runMonth
    this.runDay = data.runDay
    this.runHours = data.runHours
    this.runMinutes = data.runMinutes
    this.timeType = data.timeType
    this.idle = data.idle
    this.addEmptyRows = data.addEmptyRows
    this.sourceEquip = data.sourceEquip
    this.sourcePoint = data.sourcePoint
    this.isMailingEnabled = data.isMailingEnabled
    this.mailingSubject = data.mailingSubject
    this.mailingFileFormat = data.mailingFileFormat
    this.mailingAllowZip = data.mailingAllowZip

    this.equips = data.equips
    this.equipLists = data.equipLists
    this.points = data.points
    this.pointLists = data.pointLists
    this.measures = data.measures
    this.users = data.users
  }

  async save() {
    return await this.http.post('reportTask/task', {
      id: this.id,
      name: this.name,
      active: this.active,
      timeStart: new Date(this.timeStart).getTime(),
      timeEnd: this.timeEnd ? new Date(this.timeEnd).getTime() : null,
      winter: this.winter,
      summer: this.summer,
      archiveType: this.archiveType,
      periodType: this.periodType,
      contractDay: this.contractDay,
      contractMonth: this.contractMonth,
      contractHours: this.contractHours,
      contractMinutes: this.contractMinutes,
      runType: this.runType,
      runDataWait: this.runDataWait,
      runPeriod: this.runPeriod,
      runHours: this.runHours,
      runMinutes: this.runMinutes,
      runDay: this.runDay,
      runMonth: this.runMonth,
      timeType: this.timeType,
      idle: this.idle,
      addEmptyRows: this.addEmptyRows,
      isMailingEnabled: this.isMailingEnabled,
      mailingSubject: this.mailingSubject,
      mailingFileFormat: this.mailingFileFormat,
      mailingAllowZip: this.mailingAllowZip,
      measures: Object.entries(this.measures).map(([k, v]) => [k, v]),
      sourceEquip: this.sourceEquip,
      sourcePoint: this.sourcePoint,
      equips: this.equips.map(r => r.id),
      equipLists: this.equipLists.map(r => r.id),
      points: this.points.map(r => r.id),
      pointLists: this.pointLists.map(r => r.id),
      users: this.users.map(r => r.id)
    })
  }

  async updateMeasures() {
    try {
      const { data } = await this.http.get<Measures>('reportTask/measures', {
        params: {
          points: this.points.map(r => r.id),
          pointLists: this.pointLists.map(r => r.id),
          equips: this.equips.map(r => r.id),
          equipLists: this.equipLists.map(r => r.id),
          archiveType: this.archiveType,
          sourceEquip: this.sourceEquip,
          sourcePoint: this.sourcePoint
        }
      })

      Object.keys(data).forEach(key => {
        if (this.measures.hasOwnProperty(key)) {
          data[key] = this.measures[key]
        }
      })

      this.measures = data
    } catch (error) {
      ReportTask.store.commit('error', error)
    }
  }
}
