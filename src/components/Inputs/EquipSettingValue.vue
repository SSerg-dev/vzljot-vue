<template>
  <div>
    <select
      ref="selectElement"
      @change="handleOptionChange"
      @mousedown="enableSelect"
    >
      <option
        v-for="(item, index) in items"
        :key="index"
        :data-id="index"
        :value="item.value"
        :selected="hasSelected(item)"
      >
        <div>
          {{ item }}
          <!-- <p>Enum Value: {{ enumValue }}</p> -->
        </div>
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const EquipSettingParamValueTypeEnum = Object.freeze({
  none: 'none',
  string: 'string',
  list: 'list',
})

export default {
  name: 'EquipSettingValue',
  components: {},
  props: {
    param: {
      type: Object,
      default: () => ({}),
    },
    editName: {
      type: String,
      default: () => '',
    },
    mode: {
      type: String,
      default: () => '',
    },
  },
  data: () => ({
    items: {},
    values: '',
  }),
  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
    enumValue() {
      const { valueType, readOnly } = this.param
      let result 

      switch (valueType) {
        case 'List':
          result = readOnly
            ? EquipSettingParamValueTypeEnum.none
            : EquipSettingParamValueTypeEnum.list
          break
        case 'None':
          result = readOnly
            ? EquipSettingParamValueTypeEnum.none
            : EquipSettingParamValueTypeEnum.string
          break
        default:
          result = EquipSettingParamValueTypeEnum.none
          break
      }

      return result
    },
  },
  watch: {
    editName(newVal) {
      this.edit(newVal)
    },
  },
  created() {},
  mounted() {
    this.items = this.param.paramValues
    this.values = this.param.value
  },
  beforeUnmount() {},

  methods: {
    handleOptionChange(event) {
      const selectedId =
        +event.target.options[event.target.selectedIndex].getAttribute(
          'data-id'
        )
      const selectedValue = event.target.value
      const changedValues = {
        id: selectedId,
        caption: selectedValue,
        name: this.param.name,
        value: selectedId,
      }

      this.$emitter.emit('equip-setting-value:update', changedValues)
    },

    hasSelected(item) {
      let result
      const selectElement = this.$refs.selectElement
      if (item === this.values) {
        selectElement.style.color = 'black'
        result = true
      } else {
        result = false
      }
      return result
    },
    hasDisabled(item) {
      return item !== this.values ? true : false
    },
    edit(name) {
      name
    },
    enableSelect() {
      const selectElement = this.$refs.selectElement
      selectElement.style.color = 'black'
    },
  }, // end methods
}
</script>
<style scoped>
select {
  min-width: 190px;
  color: #ddd;
  border-color: #ddd;
}
</style>
