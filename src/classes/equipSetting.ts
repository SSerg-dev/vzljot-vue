import BaseObject from '@/classes/base/baseObject'
import { store } from '@/store/store'
import { EquipSettingTable } from '@/store/equip'

interface IEquipSetting {
  uuid?: string
  // id?: number
  // name?: string
  equipSettings?: Array<IEquipSettingItem> | null
  equipSettingTable?: EquipSettingTable | null
}

interface IEquipSettingItem {
  id: number
  caption: string | null
  name: string | null
  value: string | null
}

interface IProps {
  equipSettings?: Array<IEquipSettingItem> | null
  equipSettingTable?: EquipSettingTable | null
}

export class EquipSetting extends BaseObject {
  equipSettings?: Array<IEquipSettingItem> | null
  equipSettingTable?: EquipSettingTable | null

  constructor({
    uuid = undefined,

    // id = undefined,
    // name = '',
    equipSettings = [],
    equipSettingTable = null,
  }: IEquipSetting) {
    super(uuid)

    // this.id = id
    // this.name = name

    this.equipSettings = equipSettings
    this.equipSettingTable = equipSettingTable
  }

  async init(id: number) {
    if (!Number.isNaN(id)) {
      // const { data } = await this.http.get<Set>('set/edit', { params: { id } })
      // this.id = data.id
      // this.name = data.name
    }
  }

  async save() {
    // const obj = {
    //   id: this.id,
    //   name: this.name,
    // } 

    const props: IProps = {
      equipSettings: this.equipSettings,
      equipSettingTable: this.equipSettingTable,
    }

    this.equipSettings = EquipSetting.store.state.equip.equipSettingSave
    if (this.equipSettings) {
      props.equipSettings = this.equipSettings 
    }

    this.equipSettingTable = EquipSetting.store.state.equip.equipSettingTable
    if (this.equipSettingTable) {
      props.equipSettingTable = this.equipSettingTable
    }
    // const { data } = await this.http.post('set/save', obj)
  }
}
