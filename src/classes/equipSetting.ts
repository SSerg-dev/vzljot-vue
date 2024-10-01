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
    EquipSetting.store.state.equip.equipSettingSave = []
  }

  async init(id: number) {}

  async save() {
    const props: IProps = {
      equipSettingTable: this.equipSettingTable,
      equipSettings: this.equipSettings,
    }

    this.equipSettingTable = EquipSetting.store.state.equip.equipSettingTable
    if (this.equipSettingTable) {
      this.equipSettingTable.equipId = this.equipSettingTable.id
      props.equipSettingTable = this.equipSettingTable

      if (!props.equipSettingTable.equipSettingId)
        props.equipSettingTable.equipSettingId = this.equipSettingTable.id
    }
    this.equipSettings = EquipSetting.store.state.equip.equipSettingSave
    if (this.equipSettings) {
      props.equipSettings = this.equipSettings
    }

    const versionParamKeys: any =
      EquipSetting.store.state.equip.versionParamKeys

    const versionIndex = props.equipSettings?.findIndex(
      (item) => item.name === 'Version'
    )

    if (versionIndex !== -1) {
      const versionItem = props.equipSettings?.find(
        (item) => item.name === 'Version'
      )

      const versionSetting: any = props.equipSettings?.find(
        (setting) => setting.name === 'Version'
      )

      if (versionSetting) {
        const keyIndex = versionSetting.id.toString()

        versionSetting.value =
          versionParamKeys[keyIndex?.toString() ?? '0'] ?? '0'
      }
    } 

    const { data, status } = await this.http.post('equip/updateEquipSettings', props, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (status === 200) {
      EquipSetting.store.state.equip.equipSettingSave = []
    }
  } 

  addEquipSetting() {}
  removeEquipSetting() {}
}
