<template>
  <div>
    <select
      v-if="enumValue === 'list'"
      ref="selectElement"
      @click="handleOptionChange"
      @mousedown="enableSelect"
    >
      <option
        v-for="(item, index) in items"
        :key="index"
        :data-id="index"
        :value="item.value"
        :selected="hasSelected(item)"
      >
        {{ item }}
      </option>
    </select>

    <input
      type="text"
      v-if="enumValue === 'string'"
      v-model="inputValue"
      @input="handleInputValue"
    />

    <div class="none" v-if="enumValue === 'none'"></div>

    <div class="text" v-if="enumValue === 'text'">{{ this.param.value }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const EquipSettingParamValueTypeEnum = Object.freeze({
  none: 'none',
  string: 'string',
  list: 'list',
  text: 'text',
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
    inputValue: '',
    inputId: -1,
    inputName: '',
    hasTextType: null,
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
          result = this.getViewType(readOnly)
          break
        case 'String':
          result = readOnly
            ? EquipSettingParamValueTypeEnum.text
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
    this.inputValue = this.param.value
    this.inputId = this.param.id
    this.inputName = this.param.name
  },
  beforeUnmount() {},

  methods: {
    getViewType(readOnly) {
      this.inputValue = this.param.value
      return readOnly
        ? EquipSettingParamValueTypeEnum.text
        : EquipSettingParamValueTypeEnum.string
    },

    handleInputValue(event) {
      this.inputValue = event.target.value
      const changedValues = {
        id: this.inputId,
        caption: this.inputValue,
        name: this.inputName,
        value: this.inputValue,
      }

      this.$emitter.emit('equip-setting-value:update', changedValues)
    },
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
        value: selectedId.toString(),
      }

      this.$emitter.emit('equip-setting-value:update', changedValues)
    },
    hasSelected(item) {
      let result
      const selectElement = this.$refs.selectElement

      if (item === this.values && this.mode !== 'new') {
        selectElement.style.color = 'black'
        result = true
      } else {
        // $$
        // selectElement.style.color = 'white'
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
input {
  min-width: 190px;
  color: black;
  border-color: #ddd;
}
.none,
.text {
  min-width: 190px;
  min-height: 22px;
  padding: 1px 4px;
  color: #ddd;
  border: solid 1px;
  border-radius: 3px;
  border-color: #ddd;
}
</style>
