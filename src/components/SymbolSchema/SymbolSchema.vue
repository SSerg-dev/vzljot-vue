<template>
  <div class="component-detail" style="overflow: hidden">
    <canvas :width="schema.WidthSchema" :height="schema.HeightSchema" ref="canvas" style="position: absolute; visibility: hidden" />
    <tool-bar :exportTypes="['jpeg', 'png', 'svg']" @export="exportData">
      <template v-if="purposeGroup !== setTypes.none">
        <div :class="['button', 'fas', 'fa-arrow-alt-circle-right', { disabled: busy || !$store.state.user?.userRights.dataRead }]" title="Собрать данные" @click="onPollClick(localEquipId)" />
        <div :class="['button', 'fas', 'fa-play-circle', { disabled: busy || !$store.state.user?.userRights.dataRead }]" title="Собирать данные" @click="onPollClick(localEquipId, true)" />
        <div :class="['button', 'fas', 'fa-pause-circle', { disabled: !busy }]" title="Остановить" @click="cancel()" />
        <div class="separator" />
      </template>
      <div :class="['button', 'fas', 'fa-arrow-left', { disabled: stack.length < 1 }]" title="Назад" @click="back()" />
      <template v-if="purposeGroup === setTypes.equipType && !equipId">
        <div class="separator" />
        <div :class="['button', 'fas', 'fa-tablet-alt', { disabled: busy }]" title="Выбрать прибор" @click="onSelectEquipClick()" />
      </template>
      <template v-slot:end>
        <div v-if="openInNewWindow" :class="['button', 'fas', 'fa-expand-alt']" title="Открыть в новом окне" @click="openWindow" />
      </template>
    </tool-bar>
    <div ref="root" :style="backgroundStyle">
      <div :style="wrapperStyle">
        <component v-for="(item, index) in schema.Items" :key="index" :is="item.x.component" v-bind="getComponentData(item)" @writeDialog="openWriteWizard" @open="open" />
      </div>
      <transition>
        <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
      </transition>
    </div>
    <div v-if="purposeGroup !== setTypes.none" class="footer">
      <div :class="{ fas: true, 'fa-cog': true, cog: true, busy }" />
      <span>{{ status }}</span>
      <div>
        {{ purposeGroup === setTypes.equipType ? `Прибор: ${localEquipId ? equipText : 'не выбран'}` : null }}
      </div>
    </div>
  </div>
</template>

<script>
let abortController = new AbortController()

import Schema from './Model/schema.js'
import EventObserver from '../../plugins/eventObserver.js'
import { matchType } from '../../plugins/api.js'
import { exportSvg } from '../../plugins/export.js'

import ToolBar from '../ToolBar.vue'
import Modal from '../Modal.vue'
import ParamGroupBox from '../SymbolSchema/ParamGroupBox.vue'
import Item from '../SymbolSchema/Item.vue'
import Cone from '../SymbolSchema/Cone.vue'
import Drawing from '../SymbolSchema/Drawing.vue'
import VueImage from './Image.vue'
import ParamChart from '../SymbolSchema/ParamChart.vue'
import ParamTable from '../SymbolSchema/ParamTable.vue'
import Wizard from '../Wizard.vue'

const wizardWrite = item => {
  return {
    name: 'write',
    component: {
      text: 'Запись значения:',
      component: 'writeValue',
      event: 'changed',
      data: {
        item
      }
    }
  }
}

const wizardEquip = (http, id) => {
  return {
    name: 'equip',
    component: {
      text: 'Выбор прибора:',
      component: 'selector',
      event: 'selectionChanged',
      data: {
        singleMode: true,
        loader: async () => {
          const { data } = await http.get('symbolSchema/equipsForAction', { params: { id } })
          return data
        }
      }
    }
  }
}

const observer = new EventObserver()

export default {
  components: {
    ToolBar,
    Modal,
    ParamGroupBox,
    Item,
    Cone,
    VueImage,
    Drawing,
    ParamChart,
    ParamTable,
    Wizard
  },
  props: {
    id: Number,
    purposeGroup: Number,
    equipId: Number,
    openInNewWindow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      localEquipId: this.equipId,
      wait: false,
      schema: {
        WidthSchema: 0,
        HeightSchema: 0,
        Items: [],
        BackColor: '#fff'
      },
      equipText: null,
      stack: [],
      busy: false,
      wizard: null,
      dialog: null,
      key: new Date().getTime(),
      status: null
    }
  },
  computed: {
    backgroundStyle() {
      return {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        overflow: 'auto',
        backgroundColor: this.schema.BackColor
      }
    },
    wrapperStyle() {
      return {
        position: 'relative',
        width: this.schema.WidthSchema + 'px',
        height: this.schema.HeightSchema + 'px',
        userSelect: 'none'
      }
    },
    setTypes() {
      return matchType(this.$store.state.env.setTypes)
    }
  },
  mounted() {
    this.$nextTick().then(() => this.load(this.getModel(this.id, this.localEquipId)))
  },
  beforeUnmount() {
    abortController.abort()
  },
  methods: {
    onPollClick(equipId, loop) {
      if (this.purposeGroup === this.setTypes.equipType) {
        if (equipId) {
          this.poll(loop)
        } else {
          this.wizard = wizardEquip(this.$http, this.id)
          this.dialog = `selectEquipPoll${loop ? 'Loop' : ''}`
        }
      } else if (this.purposeGroup === this.setTypes.equipGroup) {
        this.poll(loop)
      }
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'write') {
        this.write(data)
      } else {
        let dialog = this.dialog
        this.dialog = null

        if (this.localEquipId !== data[0].id) {
          this.localEquipId = data[0].id
          this.equipText = data[0].text

          observer.dispatch('clear')
          this.getParams(this.schema.Items)
        }

        if (dialog === 'selectEquipPoll' || dialog === 'selectEquipPollLoop') {
          this.poll(dialog !== 'selectEquipPoll')
        }
      }
    },
    onSelectEquipClick() {
      this.wizard = wizardEquip(this.$http, this.id)
    },
    getModel(schemaId, equipId) {
      let model = {
        schemaId: schemaId
      }

      if (equipId) {
        model.equipId = equipId
      }

      return model
    },
    getComponentData(item) {
      return {
        item: item,
        schema: this.schema,
        observer: observer
      }
    },
    async write({ item, value }) {
      abortController = new AbortController()

      try {
        this.busy = true
        this.status = 'Запись значения...'

        await this.$http.post(
          'symbolSchema/write',
          {
            paramId: item.ParamCode,
            equipId: item.EquipIdAsoi,
            type: item.Type,
            format: item.Format,
            value: new String(value)
          },
          { signal: abortController.signal }
        )
      } catch (error) {
        if (!abortController.signal.aborted) {
          if (error.response.status === 550) {
            this.$store.commit('notification', {
              title: 'Запись значения:',
              type: 'error',
              text: error.response.data.message
            })
          } else {
            this.$store.commit('error', error)
          }
        }
      } finally {
        this.status = ''
        this.busy = false
      }
    },
    openWriteWizard(item) {
      this.wizard = wizardWrite(item)
    },
    exportData(type) {
      const parser = new DOMParser()
      const document = parser.parseFromString(this.$refs.root.outerHTML, 'application/xml')

      document.querySelectorAll('.toolbar .exportMenu').forEach(r => r.parentNode.removeChild(r))

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%">
                    <foreignObject width="100%" height="100%">
                      <div xmlns="http://www.w3.org/1999/xhtml">
                        ${document.documentElement.outerHTML}
                      </div>
                    </foreignObject>
                  </svg>`
      exportSvg(type, this.schema.NameSchema, svg, this.$refs.canvas)
    },
    getParams(items) {
      if (!items) return []
      let params = items.filter(r => r.TypeParam !== 'adapter' && r.ParamCode >= 0 && r.Type === 'paramLabel')

      if (this.purposeGroup === this.setTypes.equipType) {
        params.forEach(r => {
          r.EquipID = this.localEquipId
          r.EquipIdAsoi = this.localEquipId
        })
      }

      items.forEach(item => {
        params = [...params, ...this.getParams(item.Items)]
      })

      let set = Array.from(new Set([...params.map(r => `${r.ParamCode} ${r.ChannelNumber} ${r.EquipIdAsoi}`)]))
      return set.map(r => params.find(i => `${i.ParamCode} ${i.ChannelNumber} ${i.EquipIdAsoi}` === r))
    },
    poll(loop = false) {
      this.status = 'Запрос запущен...'
      let params = this.getParams(this.schema.Items)

      abortController = new AbortController()

      if (params.length > 0) {
        this.busy = true
        this.$http
          .post(
            'symbolSchema/poll',
            {
              parameters: params.map(r => {
                return {
                  paramId: r.ParamCode,
                  equipId: r.EquipIdAsoi,
                  type: r.Type,
                  format: r.Format,
                  channelNumber: r.ChannelNumber
                }
              }),
              key: this.key,
              loop: loop,
              pause: this.schema.ServerPause
            },
            { signal: abortController.signal }
          )
          .then(({ data }) => {
            this.status = `Запрос завершен.${data.error ? ' ' + data.error : ''}`
          })
          .catch(error => {
            this.status = ''
            if (!abortController.signal.aborted) {
              this.$store.commit('error', error)
            }
          })
          .finally(() => {
            this.busy = false
          })
      } else {
        this.status = 'Нет параметров для запроса'
      }
    },
    cancel() {
      abortController.abort()
    },
    async open(item) {
      this.cancel()

      const linkedModel = this.getModel(item.LinkSchema, item.LinkEquip)

      await this.load(linkedModel)
      this.stack.push(linkedModel)
    },
    async load(model) {
      try {
        this.wait = true
        const { data } = await this.$http.get('symbolSchema/getSchema', { params: model })
        this.equipText = data.equipText
        this.schema = new Schema(data.schema, this.key)

        if (this.schema.AutoLoadWhile) {
          this.onPollClick(model.equipId, true)
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    back() {
      this.cancel()

      this.stack.pop()

      if (this.stack.length === 0) {
        this.load(this.getModel(this.id, this.localEquipId))
      } else {
        this.load(this.stack[this.stack.length - 1])
      }
    },
    openWindow() {
      window.open(`${window.props.baseUrl}symbolSchema/schemaDetached/?id=${this.id}&purposeGroup=${this.purposeGroup}${this.localEquipId ? `&equipId=${this.localEquipId}` : ''}`, '_blank')
    }
  }
}
</script>

<style scoped>
.footer {
  padding: 3px 5px;
  display: grid;
  gap: 5px;
  grid-template-columns: min-content 1fr min-content;
  background-color: #ecf0f6;
  white-space: nowrap;
  align-items: center;
}

.cog {
  color: lightslategrey;
  font-size: 21px;
}

.cog.busy {
  animation: pollTaskSpin 1.5s linear infinite;
}
</style>
