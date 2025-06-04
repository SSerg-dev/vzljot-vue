<template>
  <div class="component-detail">
    <tool-bar
      :exportTypes="['csv', 'xls', 'xlsx']"
      @export="exportTable($event)"
    >
      <div
        :class="[
          'button',
          'fas',
          'fa-arrow-alt-circle-right',
          { disabled: !canRead },
        ]"
        title="Собрать данные"
        @click="onPollClick(set.equipId, false)"
      />
      <div
        :class="['button', 'fas', 'fa-play-circle', { disabled: !canRead }]"
        title="Собирать данные"
        @click="onPollClick(set.equipId, true)"
      />
      <div
        :class="[
          'button',
          'fas',
          'fa-arrow-alt-circle-left',
          { disabled: !canWrite },
        ]"
        title="Записать данные"
        @click="onWriteClick(set.equipId)"
      />
      <div
        :class="['button', 'fas', 'fa-pause-circle', { disabled: !busy }]"
        title="Остановить"
        @click="cancel()"
      />
      <template v-if="$store.state.user?.userRights.setEdit">
        <div class="separator" />
        <div
          :class="['button', 'fas', 'fa-plus-circle', { disabled: busy }]"
          title="Добавить..."
          @click="onAddParamClick()"
        />
        <div
          :class="[
            'button',
            'fas',
            'fa-times-circle',
            { disabled: !isAnyParam || busy },
          ]"
          title="Удалить"
          @click="onRemoveParamClick()"
        />
      </template>
      <template v-slot:end>
        <div
          :class="['button', 'fas', 'fa-cog', { disabled: busy }]"
          title="Настройки опроса"
          @click="onSettingsClick"
        />
      </template>
    </tool-bar>
    <div
      class="table-grid"
      style="grid-template-columns: repeat(9, max-content)"
    >
      <header class="header"></header>
      <header class="header">Время получения</header>
      <header class="header">
        <input
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="busy"
        />
      </header>
      <header class="header">Прибор</header>
      <header class="header">КанПар</header>
      <header class="header">Значение</header>
      <header class="header">Наименование</header>
      <header class="header">Ед. изм.</header>
      <header class="header">Тип данных</header>
      <div
        v-for="(r, i) in localParams"
        :key="i"
        class="table-row"
        :ref="(el) => (rowsElement[r.id] = el)"
      >
        <span class="cell icon">
          <div
            :class="r.task.class"
            :style="{ color: r.task.style.color }"
            :title="r.task.text"
          />
        </span>
        <span class="cell cell-value" style="justify-content: center">{{
          r.time
        }}</span>
        <span class="cell">
          <input type="checkbox" v-model="r.checked" :disabled="busy" />
        </span>
        <span class="cell">{{ r.equipTypeName }}</span>
        <span
          class="cell"
          @click="channelClick($event.target, localParams[i])"
          >{{ r.channelNumber ? r.channelNumber : '?' }}</span
        >
        <span
          class="cell cell-value"
          @click="valueClick($event.target, localParams[i])"
          >{{ r.value }}</span
        >
        <span class="cell">{{ r.name }}</span>
        <span class="cell" @click="muClick($event.target, localParams[i])">{{
          $store.state.env.mUnits[r.mu].text
        }}</span>
        <span
          class="cell"
          @click="dataTypeClick($event.target, localParams[i])"
          >{{ r.dataType }}</span
        >
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка данных...'" />
    <select
      ref="muSelect"
      v-show="muPossible"
      v-model="mu"
      @blur=";(mu = null), (muGroup = null)"
      @change="onMuChange"
      v-on:click.stop
      style="position: absolute"
    >
      <option v-for="r in muList" :key="r.value" :value="r.value">
        {{ r.text }}
      </option>
    </select>
    <select
      ref="dataTypeSelect"
      v-show="dataTypePossible"
      v-model="dataType"
      @blur="dataType = null"
      @change="onDataTypeChange"
      v-on:click.stop
      style="position: absolute"
    >
      <option v-for="r in dataTypes" :key="r" :value="r">{{ r }}</option>
    </select>
    <input
      type="text"
      ref="valueInput"
      v-show="valueVisible && valuePossible"
      v-model="value"
      @blur="valueVisible = false"
      @change="onValueChange"
      style="position: absolute"
    />
    <input
      type="text"
      ref="channelNumberInput"
      v-show="channelNumberVisible && channelNumberPossible"
      v-model.trim="channelNumber"
      @keydown="onChannelInputKeyDown"
      @blur="onChannelInputBlur"
      :class="{ 'validation-error': error.channelNumber }"
      :title="error.channelNumber"
      style="position: absolute"
    />
    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import { axios as http } from '../../plugins/axios'
import { store } from '@/store/store'

const CancelToken = axios.CancelToken
let cancel = null

import Export from '../../plugins/export.js'
import { matchType } from '../../plugins/api.js'
import { matcher } from '../../plugins/regexp.js'
import Mu from '../../plugins/model/mu.js'

import ToolBar from '../ToolBar.vue'
import PagerComponent from '../PagerComponent.vue'
import Wizard from '../Wizard.vue'

let removeClass = (el, name) => el.classList.remove(name)
let messageAction = {
  poll: 'pollSet',
  write: 'writeSet',
}

const wizardAddParams = (set) => {
  let paramColumns = [
    {
      prop: 'text',
      text: 'Наименование',
    },
    {
      prop: 'channelNumber',
      text: 'КанПар',
    },
  ]

  if (set.type === matchType(store.state.env.setTypes).equipType) {
    const param = { params: { equipTypeId: set.equipTypeId } }

    return {
      name: 'add',
      component: {
        text: 'Выберите параметры',
        component: 'selector',
        event: 'selectionChanged',
        data: {
          loader: async () => {
            let { data } = await http.get('set/getEquipTypeParams', param)
            return data
          },
          columns: paramColumns,
        },
      },
    }
  } else {
    return {
      name: 'add',
      component: {
        text: 'Выбор прибора:',
        component: 'selector',
        event: 'selectionChanged',
        data: {
          singleMode: true,
          loader: () => {
            return set.equips.map((r) => ({
              id: r.id,
              equipId: r.equipId,
              type: r.type,
              text: r.text,
              state: r.state,
              connectionGroupType: r.connectionGroupType,
            }))
          },
        },
        next(data) {
          const param = { params: { setId: set.id, equipId: data[0].equipId } }

          return {
            text: 'Выберите параметры',
            component: 'selector',
            event: 'selectionChanged',
            data: {
              loader: async () => {
                let { data } = await http.get('set/getEquipParams', param)
                return data
              },
              columns: paramColumns,
            },
          }
        },
      },
    }
  }
}

const wizardRemoveParams = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление параметров:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные параметры?',
      },
    },
  }
}

const wizardSettings = (pause, convert) => {
  return {
    name: 'settings',
    component: {
      text: 'Настройки опроса:',
      component: 'set-settings',
      event: 'changed',
      data: {
        pause,
        convert,
      },
    },
  }
}

const wizardEquip = (equipTypeId, name) => {
  return {
    name: name,
    component: {
      text: 'Выбор прибора:',
      component: 'selector',
      event: 'selectionChanged',
      data: {
        singleMode: true,
        loader: async () => {
          let { data } = await http.get('set/getSelectorEquips', {
            params: { equipTypeId },
          })
          return data
        },
      },
    },
  }
}

let pattern = {
  [Symbol.iterator]() {
    let props = [
      {
        prop: 'equipTypeName',
        text: 'Прибор',
      },
      {
        prop: 'channelNumber',
        text: 'КанПар',
      },
      {
        prop: 'value',
        text: 'Значение',
      },
      {
        prop: 'name',
        text: 'Наименование',
      },
      {
        prop: 'mu',
        text: 'Ед. изм.',
      },
      {
        prop: 'dataType',
        text: 'Тип данных',
      },
    ]

    let index = 0
    return {
      next() {
        return index < props.length
          ? {
              value: props[index++],
              done: false,
            }
          : {
              done: true,
            }
      },
    }
  },
}

let keyCodes = new Array(
  ...'0123456789 ,-'.split(''),
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Space',
  'Tab',
  'Enter'
)

export default {
  name: 'setParams',
  components: {
    PagerComponent,
    ToolBar,
    Wizard,
  },
  props: {
    set: Object,
  },
  data() {
    return {
      wait: false,
      pattern: [...pattern],
      wizard: null,
      pageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      all: true,
      busy: false,
      mu: null,
      muGroup: null,
      clickedRow: null,
      pause: 1,
      convert: true,
      key: new Date().getTime(),
      value: null,
      channelNumber: null,
      valueVisible: false,
      channelNumberVisible: false,
      dataType: null,
      error: {
        channelNumber: null,
      },
      exporter: new Export(this.$http),
      rowsElement: {},
    }
  },
  created() {
    this.$emitter.on('message', this.processMessage)

    this.$watch(
      () => this.set.params.length,
      () => (this.pageInfo.Items = this.set.params.length)
    )
    this.pageInfo.Items = this.set.params.length
  },
  computed: {
    canWrite() {
      return (
        !this.busy &&
        this.isAnyParam &&
        this.$store.state.user?.userRights.dataWrite
      )
    },
    canRead() {
      return (
        !this.busy &&
        this.isAnyParam &&
        this.$store.state.user?.userRights.dataRead
      )
    },
    isAnyParam() {
      return this.set.params.some((r) => r.checked === true)
    },
    muPossible() {
      return (
        this.mu &&
        (this.muGroup ? this.muGroup.units.length > 1 : false) &&
        this.convert &&
        !this.busy
      )
    },
    valuePossible() {
      return !this.busy
    },
    channelNumberPossible() {
      return !this.busy && this.$store.state.user?.userRights.setEdit
    },
    dataTypePossible() {
      return !this.busy && this.convert && this.dataType
    },
    muList() {
      let list = []
      if (this.muPossible) {
        list = this.muGroup.units.map((r) => this.$store.state.env.mUnits[r])
      }
      return list
    },
    dataTypes() {
      let list = []
      if (this.dataTypePossible && this.clickedRow) {
        list = this.$store.state.env.mUnits[this.clickedRow.mu].getDataTypes()
      }
      return list
    },
    setTypes() {
      return matchType(this.$store.state.env.setTypes)
    },
    localParams() {
      const firstIndex = (this.pageInfo.Page - 1) * this.pageInfo.Size
      const lastIndex =
        this.pageInfo.Page * this.pageInfo.Size > this.set.params.length
          ? this.set.params.length
          : this.pageInfo.Page * this.pageInfo.Size

      return this.set.params.slice(firstIndex, lastIndex)
    },
  },
  beforeUnmount() {
    if (cancel) this.cancel()
  },
  methods: {
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page
    },
    onValueChange() {
      this.clickedRow.value = this.value
      this.value = null
      this.$emit('changed')
    },
    onDataTypeChange() {
      this.clickedRow.dataType = this.dataType
      this.dataType = null
      this.$emit('changed')
    },
    onMuChange() {
      this.clickedRow.mu = this.mu
      this.mu = null
      this.muGroup = null
      this.$emit('changed')
    },
    onChannelInputBlur() {
      this.updateChannelNumber()
    },
    onChannelInputKeyDown(e) {
      if (keyCodes.includes(e.key)) {
        this.error.channelNumber = null
        if (e.key === 'Enter') {
          this.$refs.channelNumberInput.blur()
        }
      } else {
        e.preventDefault()
      }
    },
    updateChannelNumber() {
      const minValue =
        this.$store.state.env.equipTypeCodes[this.clickedRow.equipTypeId]
          .type !== 'modbus'
          ? 1
          : 0
      const maxValue =
        this.$store.state.env.equipTypeCodes[this.clickedRow.equipTypeId]
          .type !== 'modbus'
          ? this.clickedRow.channelNumber >> 16
          : 65535

      let checkValue = (value) => minValue <= value && value <= maxValue
      let setError = (text) => {
        this.error.channelNumber = text
        setTimeout(() => {
          this.$refs.channelNumberInput.focus()
        }, 0)
      }

      let rawValues = this.channelNumber
        .toString()
        .replace(/\s+/g, '')
        .split(',')
      let result = []
      for (let rawValue of rawValues) {
        let values = rawValue
          .split('-')
          .filter((r) => r !== '')
          .map((r) => parseInt(r))
        if (values.length === 1) {
          if (checkValue(values[0])) {
            result.push(values[0])
          } else {
            setError('Ошибка формата')
          }
        } else if (values.length === 2) {
          let min = Math.min(...values)
          let max = Math.max(...values)
          if (checkValue(min) && checkValue(max)) {
            while (min <= max) {
              result.push(min++)
            }
          } else {
            setError('Ошибка формата')
          }
        } else if (values.length !== 0) {
          setError('Ошибка формата')
        }
      }

      if (result.length !== 0 && !this.error.channelNumber) {
        this.addChannelNumber(this.clickedRow, result)
        this.$emit('changed')
      }
      this.channelNumberVisible = false
    },
    updateNameByChannel(equipTypeParamName, name, channelNumber) {
      if (name.startsWith(equipTypeParamName)) {
        const text = ', канал '
        const ind = name.lastIndexOf(text)

        if (ind >= 0 && name.substring(0, ind) === equipTypeParamName) {
          const end = name.substring(ind).replace(text, '')
          if (end.length > 0) {
            return name.substring(0, ind) + text + channelNumber
          }
        } else if (name.length == equipTypeParamName.length) {
          return name + text + channelNumber
        }
      }
      return name
    },
    addChannelNumber(param, values) {
      param.channelNumber = values.shift()
      param.name = this.updateNameByChannel(
        param.equipTypeParamName,
        param.name,
        param.channelNumber
      )

      if (
        this.$store.state.env.equipTypeCodes[param.equipTypeId].type ===
        'modbus'
      ) {
        param.readCode = param.channelNumber
        param.writeCode = param.channelNumber
      }

      this.$emit(
        'addParams',
        values.map((value) => {
          const r = JSON.parse(JSON.stringify(param))

          r.id = null
          r.channelNumber = value
          r.name = this.updateNameByChannel(
            r.equipTypeParamName,
            r.name,
            r.channelNumber
          )

          if (
            this.$store.state.env.equipTypeCodes[param.equipTypeId].type ===
            'modbus'
          ) {
            r.readCode = value
            r.writeCode = value
          }
          return r
        })
      )
    },
    cancelWizard() {
      this.wizard = null
    },
    async onWizardEnd(data, name) {
      if (name === 'add') {
        this.$emit('addParams', data)
      } else if (name === 'remove') {
        this.$emit(
          'removeParams',
          this.set.params.filter((r) => r.checked === true)
        )
      } else if (name === 'settings') {
        if (data != null) {
          this.convert = data.convert
          this.pause = data.pause
        }
      } else if (name === 'equip') {
        this.pollSet(data[0].id)
      } else if (name === 'equipLoop') {
        this.pollSet(data[0].id, true)
      } else if (name === 'equipWrite') {
        this.writeSet(data[0].id)
      }

      this.wizard = null
    },
    onSettingsClick() {
      this.wizard = wizardSettings(this.pause, this.convert)
    },
    onAddParamClick() {
      this.wizard = wizardAddParams(this.set)
    },
    onRemoveParamClick() {
      this.wizard = wizardRemoveParams()
    },
    onWriteClick(equipId) {
      if (this.set.type === this.setTypes.equipType) {
        if (equipId) {
          this.writeSet(equipId)
        } else {
          this.wizard = wizardEquip(this.set.equipTypeId, 'equipWrite')
        }
      } else if (this.set.type === this.setTypes.equipGroup) {
        this.writeSet(null)
      }
    },
    onPollClick(equipId, loop) {
      if (this.set.type === this.setTypes.equipType) {
        if (equipId) {
          this.pollSet(equipId, loop)
        } else {
          this.wizard = wizardEquip(
            this.set.equipTypeId,
            loop ? 'equipLoop' : 'equip'
          )
        }
      } else if (this.set.type === this.setTypes.equipGroup) {
        this.pollSet(null, loop)
      }
    },
    muClick(cell, row) {
      if (this.busy) return

      this.clickedRow = row
      this.mu = row.mu
      if (row.mu) {
        this.muGroup =
          this.$store.state.env.mUnitGroups[
            this.$store.state.env.mUnits[this.mu].group
          ]
        if (this.muGroup && this.muGroup.units.length > 1) {
          this.setPosition(cell, this.$refs.muSelect)
        }
      }
    },
    dataTypeClick(cell, row) {
      if (this.busy) return

      this.clickedRow = row
      this.dataType = row.dataType
      this.setPosition(cell, this.$refs.dataTypeSelect)
    },
    valueClick(cell, row) {
      if (this.busy) return

      this.clickedRow = row
      this.setPosition(cell, this.$refs.valueInput)
      this.value = row.value
      this.valueVisible = true
    },
    channelClick(cell, row) {
      if (this.busy) return

      this.clickedRow = row
      if (
        this.$store.state.env.equipTypeCodes[row.equipTypeId].type ===
          'modbus' ||
        this.$store.state.env.equipTypeCodes[row.equipTypeId].type === 'SPE542'
      ) {
        this.setPosition(cell, this.$refs.channelNumberInput)
        this.channelNumber =
          !isNaN(parseFloat(row.channelNumber)) && isFinite(row.channelNumber)
            ? row.channelNumber
            : ''
        this.channelNumberVisible = true
      }
    },
    setPosition(cell, el) {
      let cellBox = cell.getBoundingClientRect()
      let contBox = this.$el.getBoundingClientRect()
      el.style.top = `${cellBox.top - contBox.top + scrollY}px`
      el.style.left = `${cellBox.left - contBox.left + scrollX}px`
      el.style.width = `${cellBox.width}px`
      el.style.height = `${cellBox.height}px`

      this.$nextTick().then(() => el.focus())
    },
    changeAll() {
      this.set.params.forEach((r) => (r.checked = this.all))
    },
    async exportTable(type) {
      this.wait = true
      try {
        await this.exporter.post('set/exportParams', {
          columns: this.pattern.map((r) => r.text),
          data: this.set.params.map((r) =>
            this.pattern.map((prop) => {
              if (prop.prop === 'mu') {
                const mu = this.$store.state.env.mUnits[r[prop.prop]]

                return mu ? mu.text : ''
              }

              const value = r[prop.prop]
              return value === null ? '' : new String(value)
            })
          ),
          name: `Набор - ${this.set.name}`,
          type: type,
        })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    formatDate(date) {
      return `${('0' + date.getDate()).slice(-2)}.${(
        '0' +
        (date.getMonth() + 1)
      ).slice(-2)}.${date.getFullYear()} ${('0' + date.getHours()).slice(
        -2
      )}:${('0' + date.getMinutes()).slice(-2)}:${(
        '0' + date.getSeconds()
      ).slice(-2)}`
    },
    processMessage(message) {
      if (
        (message.data.action === messageAction.poll ||
          message.data.action === messageAction.write) &&
        message.data.key === this.key
      ) {
        let rows = []

        if (message.data.hasOwnProperty('paramId')) {
          rows = this.set.params.filter(
            (r) =>
              r.equipTypeParamId === message.data.paramId &&
              (message.data.hasOwnProperty('channelNumber')
                ? r.channelNumber === message.data.channelNumber
                : true)
          )
        } else if (message.data.hasOwnProperty('equips')) {
          rows = this.set.params.filter(
            (r) =>
              (message.data.equips.includes(r.equipId) ||
                r.equipId === undefined) &&
              r.checked
          )
        }

        rows.forEach((r) => {
          if (!message.data.loop) {
            r.task.class.poll = false
          }

          if (message.data.state === 'success') {
            r.task.style.color = 'mediumseagreen'
            r.task.text = 'Выполнено'

            if (
              r.dataType === 'dateTime' &&
              typeof message.data.value === 'string' &&
              matcher.isoDate.test(message.data.value)
            ) {
              message.data.value = new Date(message.data.value)
            }

            r.value =
              message.data.value instanceof Date
                ? this.formatDate(message.data.value)
                : message.data.value
            r.mu = message.data.mu
            if (message.data.action === messageAction.poll) {
              r.time = new Date().toLocaleTimeString()
              r.equipMu = message.data.equipMu
            }
          } else if (message.data.state === 'error') {
            r.task.style.color = 'crimson'
            r.task.text = message.data.error
          }

          if (this.rowsElement[r.id]) {
            this.rowsElement[r.id].classList.add('param-animation')
            setTimeout(
              removeClass,
              500,
              this.rowsElement[r.id],
              'param-animation'
            )
          }
        })
      }
    },
    writeSet(equipId) {
      this.$emit('busy', true)
      let title = 'Запись данных:'

      if (this.set.params.some((r) => r.checked)) {
        if (this.set.params.some((r) => r.equipMu === undefined && r.checked)) {
          this.$store.commit('notification', {
            title: title,
            type: 'error',
            text: 'Перед записью необходимо предварительно прочитать значения.',
          })
        } else {
          this.busy = true

          this.set.params
            .filter((r) => r.checked)
            .forEach((r) => {
              r.task.class.poll = true
              r.task.style.color = 'lightslategray'
              r.time = null
            })

          const parameters = this.set.params
            .filter((r) => r.checked)
            .map((r) => {
              return {
                equipId:
                  this.set.type === this.setTypes.equipType
                    ? equipId
                    : r.equipId,
                equipTypeParamId: r.equipTypeParamId,
                unit: r.equipMu.value,
                dataType: r.dataType,
                channelNumber: r.channelNumber,
                value: new Mu(r.mu).convert(r.value, new Mu(r.equipMu)),
                readCode: r.readCode,
                writeCode: r.writeCode,
              }
            })

          this.$http
            .post(
              'set/write',
              {
                key: this.key,
                parameters,
              },
              {
                cancelToken: new CancelToken(function executor(c) {
                  cancel = c
                }),
              }
            )
            .catch((error) => {
              if (axios.isCancel(error)) {
                cancel = null
                this.$store.commit('notification', {
                  title: title,
                  type: 'error',
                  text: error.message,
                })
              } else {
                this.$store.commit('error', error)
              }
            })
            .finally(() => {
              this.busy = false
              this.$emit('busy', false)
            })
        }
      } else {
        this.$store.commit('notification', {
          title: title,
          type: 'error',
          text: 'Не выбраны параметры для записи',
        })
      }
    },
    pollSet(equipId, loop = false) {
      this.$emit('busy', true)
      this.set.params
        .filter((r) => r.checked)
        .forEach((r) => {
          r.task.class.poll = true
          r.task.style.color = 'lightslategray'
          r.time = null
        })

      this.busy = true
      this.$http
        .post(
          'set/poll',
          {
            key: this.key,
            loop,
            pause: this.pause,
            convert: this.convert,
            parameters: this.set.params
              .filter((r) => r.checked)
              .map((r) => ({
                equipId:
                  this.set.type === this.setTypes.equipType
                    ? equipId
                    : r.equipId,
                equipTypeParamId: r.equipTypeParamId,
                unit: r.mu,
                dataType: r.dataType,
                channelNumber: r.channelNumber,
                readCode: r.readCode,
                writeCode: r.writeCode,
              })),
          },
          {
            cancelToken: new CancelToken(function executor(c) {
              cancel = c
            }),
          }
        )
        .catch((error) => {
          if (axios.isCancel(error)) {
            cancel = null
          } else {
            this.$store.commit('error', error)
          }
        })
        .finally(() => {
          this.set.params.forEach((r) => (r.task.class.poll = false))
          this.busy = false
          this.$emit('busy', false)
        })
    },
    cancel() {
      cancel('Операция отменена пользователем.')
    },
  },
}
</script>

<style scoped>
.cog {
  font-size: 21px;
}

.poll {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.param-animation .cell-value {
  animation: changevalue 0.5s ease-in-out 1;
}

@keyframes changevalue {
  0% {
    background-color: #ecf0f6;
    color: crimson;
  }

  100% {
  }
}
</style>
