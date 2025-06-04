import BaseObject from '@/classes/base/baseObject'
import { store } from '@/store/store'
import { EquipSettingTable } from '@/store/equip'
import { log } from './utils/common.functions'
import { Emitter } from 'mitt'

interface IEquipSetting {
  uuid?: string
  id?: number
  name?: string
  equipSettingTable?: EquipSettingTable | null
  equipSettings?: Array<IEquipSettingItem> | null
}

interface IEquipSettingItem {
  id: number | null
  caption: string | null
  name: string | null
  value: string | null
}

interface IProps {
  equipSettingTable?: EquipSettingTable | null
  equipSettings?: Array<IEquipSettingItem> | null
}

export default class EquipSetting extends BaseObject {
  id?: number | undefined
  name?: string

  equipSettingTable?: EquipSettingTable | null
  equipSettings?: Array<IEquipSettingItem> | null

  constructor({
    uuid = undefined,

    id = undefined,
    name = '',

    equipSettingTable = null,
    equipSettings = [],
  }: IEquipSetting) {
    super(uuid)

    this.id = id
    this.name = name

    this.equipSettingTable = equipSettingTable
    this.equipSettings = equipSettings
    EquipSetting.store.state.equip.equipSettingSave = []
  }

  async init(id: number) {}

  async save() {
    const props: IProps = {
      equipSettingTable: this.equipSettingTable,
      equipSettings: this.equipSettings,
    }

    if (
      EquipSetting.store?.state?.equip?.equipSettingTable &&
      (EquipSetting.store.state.equip.equipSettingTable.action === 'add' ||
        EquipSetting.store.state.equip.equipSettingTable.action === 'create')
    ) {
      EquipSetting.store.state.equip.equipSettingTable.timeStart =
        new Date(
          EquipSetting.store.state.equip.equipSettingTable.timeStart as Date
        ) ?? new Date()

      EquipSetting.store.state.equip.equipSettingTable.timeStart.setMinutes(
        0,
        0,
        0
      )
      const timezoneOffset =
        EquipSetting.store.state.equip.equipSettingTable.timeStart.getTimezoneOffset()

      EquipSetting.store.state.equip.equipSettingTable.timeStart = new Date(
        EquipSetting.store.state.equip.equipSettingTable.timeStart.getTime() -
          timezoneOffset * 60 * 1000
      )
    }

    this.equipSettingTable = EquipSetting.store.state.equip.equipSettingTable

    if (this.equipSettingTable) {
      this.equipSettingTable.equipId =
        EquipSetting.store.state.card.selectedNodeId

      props.equipSettingTable = this.equipSettingTable

      if (!props.equipSettingTable.equipSettingId) {
        props.equipSettingTable.equipSettingId = this.equipSettingTable.id
      }

      if (EquipSetting.store.state.equip.equipSettingTable?.action) {
        props.equipSettingTable.action =
          EquipSetting.store.state.equip.equipSettingTable.action
        if (
          EquipSetting.store.state.equip.equipSettingTable.action === 'add' ||
          EquipSetting.store.state.equip.equipSettingTable.action === 'create'
        ) {
          props.equipSettingTable.equipSettingId = 0
        }
      }
    }
    this.equipSettings = EquipSetting.store.state.equip.equipSettingSave

    if (this.equipSettings) {
      props.equipSettings = this.equipSettings
    }

    const versionIndex = props.equipSettings?.findIndex(
      (item) => item.name === 'Version'
    )

    if (versionIndex !== -1) {
      const versionParamKeys: any = {
        ...EquipSetting.store.state.equip.versionParamKeys,
      }

      const values: any = Object.values(versionParamKeys)

      let id
      if (Array.isArray(EquipSetting.store.state.equip?.equipSettingSave)) {
        id = EquipSetting.store.state.equip?.equipSettingSave[0]?.id
      }

      if (Array.isArray(props?.equipSettings)) {
        props.equipSettings[0].value = values[id] ?? '0'
      }
    }

    const { data, status } = await this.http.post(
      'equip/updateEquipSettings',
      props,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (status === 200) {
      EquipSetting.store.state.equip.equipSettingSave = []
      if (
        typeof EquipSetting.store.state.equip.equipSettingTable?.action ===
          'string' &&
        EquipSetting.store?.state?.equip?.equipSettingTable
      ) {
        EquipSetting.store.state.equip.equipSettingTable.action = null
      }
    }
  }

  async remove(ids: number[]) {
    try {
      const { data, status } = await this.http.delete(
        'equip/removeEquipSetting',
        { params: { ids } }
      )
      return status === 200 ? true : false
    } catch (error) {
      console.error(`Error fetching equip/removeEquipSetting: ${error}`)
    }
  }
}
