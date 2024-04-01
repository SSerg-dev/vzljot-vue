<template>
  <div>
    <equip-detail-setting-list-item />
    <!-- <set-component-equip-detail-setting /> -->
  </div>
  
</template>

<script>
import BaseComponent from '@/components/Base/BaseComponent.vue'
import EquipDetailSettingListItem from '@/components/Equip/EquipDetailSettingListItem.vue'
// import SetComponentEquipDetailSetting from '@/components/Set/SetComponentEquipDetailSetting.vue'


export default {
  name: 'EquipDetailSettingList',
  components: {
    EquipDetailSettingListItem,
    // SetComponentEquipDetailSetting 
  },
  extends: BaseComponent,
}
</script>
