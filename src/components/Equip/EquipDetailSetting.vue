<template>
  <div>
    <set-params-equip-detail-setting />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseComponent from '@/components/Base/BaseComponent.vue'
import { Equip } from '@/classes/equip'
import SetParamsEquipDetailSetting from '@/components/Set/SetParamsEquipDetailSetting.vue'

export default {
  name: 'EquipDetailSetting',
  components: {
    SetParamsEquipDetailSetting,
  },
  extends: BaseComponent,
  props: {
    equip: {
      type: Equip,
      default: () => new Equip({}),
    },
  },
  data() {
    return {
      localEquip: new Equip(this.equip),
      isVisible: false,
    }
  },

  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
  },

  watch: {
    equip(newValue) {
      const options = {
        equipId: null,
        equipTypeId: newValue.equipType,
        id: newValue.id,
        uuid: newValue.uuid,
        name: newValue.name,
        serialNumber: newValue.serialNumber,
        equipTypeName: newValue.equipTypes[0].name,
      }

      this.$store.commit('setEquip', options) 
      this.isVisible = true
    },
  },
  created() {
    this.$emitter.on('equip-setting-value:update', this.update)
    this.$emitter.on('set-params-equip-setting:update', this.change)

    this.$emitter.on('equip-setting-value:update', this.change)
    this.$watch(
      () => this.equip,
      (value) => (this.localEquip = new Equip(value)),
      { deep: true }
    )
  },
  mounted() {},
  beforeUnmount() {
    clearTimeout(this.timeout)
    this.isVisible = false
  },
  methods: {
    update(changedValues) {
      const options = {
        equipSettingSave: changedValues,
      }
      this.$store.commit('setEquip', options)
      this.$emit('equip-setting-update', changedValues)
    },
    change(changedValues) {
      this.$emit('equip-setting-update', changedValues)
    },
  }, // end methods
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
