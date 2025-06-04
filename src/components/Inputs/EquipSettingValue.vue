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
        :selected="hasSelected(item, index)"
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
})

export default {
  name: 'EquipSettingValue',
  components: {},
  props: {
    mode: {
      type: String,
      default: () => '',
    },
    param: {
      type: Object,
      default: () => ({}),
    },
    editName: {
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
    defaultKey: null,
    previousSelectedValue: null,
  }),
  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
    enumValue() {
      const { valueType, readOnly, defaultValue } = this.param
      defaultValue

      let result
      switch (valueType) {
        case 'List':
          result = readOnly
            ? EquipSettingParamValueTypeEnum.text 
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
  created() {},
  mounted() {
    this.items = this.param.paramValues
    this.values = this.param.value

    if (this.mode === 'new' && this.param.defaultValue) {
      Object.keys(this.param.paramValues).length === 0
        ? (this.inputValue = this.param.defaultValue)
        : (this.defaultKey = this.param.defaultValue)
    } else {
      this.inputValue = this.param.value
    }

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
      const currentValue = event.target.value
      if (
        currentValue === this.previousSelectedValue ||
        this.previousSelectedValue === null
      ) {
        this.previousSelectedValue = 'none'
        return
      }
      this.previousSelectedValue = currentValue

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
    hasSelected(item, index) {
      const type = this.mode
      const selectElement = this.$refs.selectElement

      switch (type) {
        case 'new':
          if (index === this.defaultKey) {
            selectElement.style.color = 'black'
          } else if (!this.defaultKey) {
            selectElement.style.color = 'white'
          }
          return index === this.defaultKey

        case 'change':
          if (item === this.values) {
            selectElement.style.color = 'black'
            return true
          }
          break

        default:
          return false
      }
    },
    hasDisabled(item) {
      return item !== this.values ? true : false
    },
    edit(name) {
      name
    },
    enableSelect() {
      this.previousSelectedValue = null

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
