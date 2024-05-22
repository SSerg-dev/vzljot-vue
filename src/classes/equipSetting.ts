import BaseObject from '@/classes/base/baseObject'
import { store } from '@/store/store'
import { EquipSettingTable } from '@/store/equip'
import { log } from './utils/common.functions'

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
  }

  async init(id: number) {}

  async save() {
    const props: IProps = {
      equipSettingTable: this.equipSettingTable,
      equipSettings: this.equipSettings,
    }

    this.equipSettingTable = EquipSetting.store.state.equip.equipSettingTable
    if (this.equipSettingTable) {
      props.equipSettingTable = this.equipSettingTable
    }

    this.equipSettings = EquipSetting.store.state.equip.equipSettingSave
    if (this.equipSettings) {
      props.equipSettings = this.equipSettings
    }

    const { data } = await this.http.post('equip/updateEquipSettings', props, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  addEquipSetting() {}
  removeEquipSetting() {}
}
