<template>
  <div>
    <EquipDetailSettingList />
  </div>
</template>

<script>
import BaseComponent from '@/components/Base/BaseComponent.vue'
import EquipDetailSettingList from '@/components/Equip/EquipDetailSettingList.vue'

export default {
  name: 'EquipDetailSetting',
  components: {
    EquipDetailSettingList,
  },
  extends: BaseComponent,
  props: {
    equip: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  beforeUnmount() {
    clearTimeout(this.timeout)
  },
  methods: {}, // end methods
}
</script>

<style scoped>
.equip-grid {
  display: grid;
  gap: 5px 3px;
  min-width: 450px;
}

/* equip-setting */
.equip-setting-container {
  display: flex;
  flex-direction: row;
  margin-bottom: 5px;
}
.equip-setting-item-1 {
  align-self: start;
  justify-self: center;
}
.equip-setting-item-2 {
  align-self: center;
  justify-self: center;
  margin-right: 10px;
}
.equip-setting-item-3 {
  align-self: end;
  justify-self: center;
  margin-right: 2px;
}
.equip-setting-item-4 {
  align-self: center;
  justify-self: center;
}
.date-picker {
  width: 13.2%;
}
</style>
