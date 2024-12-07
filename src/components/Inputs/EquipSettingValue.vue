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
    <div class="text" v-if="enumValue === 'text' && !readOnly">
      {{ this.param.value }}
    </div>
    <div class="read-only" v-if="readOnly">{{ this.param.value }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const EquipSettingParamValueTypeEnum = Object.freeze({
  none: 'none',
  string: 'string',
  list: 'list',
  text: 'text',
  default: 'default'
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
    readOnly: false,
    hasTextType: null,
  }),
  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
    enumValue() {
      const { caption, valueType, readOnly, defaultValue } = this.param
      
      console.log('---------------------------------------', )
      console.log('$$ this.param', JSON.stringify(caption))
      console.log('$$ valueType', JSON.stringify(valueType))
      console.log('$$ readOnly', JSON.stringify(readOnly))
      console.log('$$ defaultValue',  JSON.stringify(defaultValue))

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
    editName(value) {
      this.edit(value)
    },
  },
  created() {
    
  },
  mounted() {
    this.items = this.param.paramValues
    this.values = this.param.value
    this.inputValue = this.param.value
    this.inputId = this.param.id
    this.inputName = this.param.name
    this.readOnly = this.param?.readOnly ?? false

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
        this.param.name !== 'Version'
          ? +event.target.options[event.target.selectedIndex].getAttribute(
              'data-id'
            )
          : event.target.selectedIndex

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
      const type = this.mode
      const selectElement = this.$refs.selectElement

      switch (type) {
        case 'new':
          selectElement.style.color = 'white'
          result = true
          break

        case 'change':
          if (item === this.values) {
            selectElement.style.color = 'black'
            result = true
          }
          break

        default:
          result = false
          break
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
  color: #fff;
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
.read-only {
  min-width: 190px;
  min-height: 22px;
  padding: 1px 4px;
  color: rgb(111, 111, 111);
  border: solid 1px;
  border-radius: 3px;
  border-color: #ddd;
}
</style>
