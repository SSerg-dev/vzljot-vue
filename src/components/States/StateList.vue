<template>
  <div class="component-detail">
    <tool-bar>
      <div
        v-if="$store.state.user?.userRights.systemMessageStatusReset"
        :class="[
          'button',
          'fas',
          'fa-times-circle',
          { disabled: !hasSelected || wait },
        ]"
        title="Очистить"
        @click="onRemoveClick"
      />
      <template v-slot:end>
        <div
          :class="[
            'button',
            'fas',
            'fa-filter',
            'remove-sign',
            { disabled: !hasFilterChanges },
          ]"
          title="Очистить фильтр"
          @click="onClearFilterClick"
        />
        <div
          :class="['button', 'fas', 'fa-filter']"
          title="Фильтр..."
          @click="onFilterClick"
        />
      </template>
    </tool-bar>
    <div
      class="table-grid"
      :style="{
        'grid-template-columns': `repeat(${columnsCount}, max-content)`,
      }"
    >
      <header v-if="$store.state.user?.userRights.analyse"></header>
      <header v-if="$store.state.user?.userRights.systemMessageStatusReset">
        <check-box
          class="header-box"
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="wait"
        ></check-box>
      </header>
      <header>Получение</header>
      <header>Тип объекта</header>
      <header>Объект</header>
      <header>Сообщение</header>
      <header>Возникновение</header>
      <header>Обновление</header>
      <header>Источник</header>
      <div v-for="(r, i) in localItems" :key="i" class="table-row">
        <span v-if="$store.state.user?.userRights.analyse" class="cell">
          <div
            :class="r.hasAnalyze ? 'fas fa-chart-pie clickable-icon' : ''"
            @click="viewClick(r)"
            title="Просмотр..."
          />
        </span>
        <span
          class="cell cell-box icon"
          v-if="$store.state.user?.userRights.systemMessageStatusReset"
        >
          <check-box
            v-if="r.reset" 
            type="checkbox"
            v-model="r.checked"
            :disabled="wait"
          ></check-box> 
        </span>
        <span class="cell">{{
          r.recieve ? new Date(r.recieve).toLocaleString() : '' 
        }}</span>
        <span class="cell">{{ r.type }}</span>
        <span class="cell">{{ r.text }}</span>
        <span class="cell">{{ r.message }}</span>
        <span class="cell">{{
          r.event ? new Date(r.event).toLocaleString() : ''
        }}</span>
        <span class="cell">{{
          r.lastEvent ? new Date(r.lastEvent).toLocaleString() : ''
        }}</span>
        <span class="cell">{{ r.sourceText }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка...'" />
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
      <props-component
        v-if="edit"
        :text="`Анализ: ${component.text}`"
        @close="close"
      >
        <component :is="component.name" v-bind="component.data" />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import { asyncImport } from '../../plugins/api'

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import PropsComponent from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'

const wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'statesFilter',
      event: 'changed',
      data: {
        filter,
      },
    },
  }
}

const wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Сброс событий:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите сбросить выбранные события?',
      },
    },
  }
}

export default {
  components: {
    Analyze: asyncImport(() => import('../Analyze/AnalyzeComponent.vue')),
    Temperature: asyncImport(() =>
      import('../Analyze/TemperatureComponent.vue')
    ),
    PagerComponent,
    PropsComponent,
    ToolBar,
    Wizard,
    CheckBox,
  },
  extends: ListComponent,
  props: {
    id: Number,
    type: String,
  },
  data() {
    return {
      filter: this.emptyFilter(),
      wait: false,
      wizard: null,
      edit: false,
      all: false,
      component: {
        name: null,
        data: null,
        text: null,
      },
    }
  },
  computed: {
    nodeEquipListChanged() {
      return this.$store.state.nodeEquipListChanged
    },
    columnsCount() {
      let columns = 9
      if (!this.$store.state.user?.userRights.analyse) columns--
      if (!this.$store.state.user?.userRights.systemMessageStatusReset)
        columns--
      return columns
    },
  },
  watch: {
    nodeEquipListChanged: {
      handler(value) {
        if (value) {
          this.get(1, this.pageInfo.Size)
          this.$store.commit('nodeEquipListChanged', false)
        }
      },
    },
  },
  methods: {
    emptyFilter() {
      return {
        recieveFrom: null,
        recieveTo: null,
        eventFrom: null,
        eventTo: null,
        lastEventFrom: null,
        lastEventTo: null,
        obj: null,
        objType: null,
        message: null,
        source: null,
      }
    },
    async viewClick(r) {
      this.wait = true
      try {
        const { data } = await this.$http.get('systemMessage/status', {
          params: { id: r.id, objectId: r.objectId },
        })

        this.component = {
          name: data.component,
          data: {
            id: data.id,
            timeStart: r.timeEvent
              ? new Date(r.timeEvent)
              : new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() - 1,
                  new Date().getDate()
                ),
            timeEnd: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
              23,
              59,
              59
            ),
            pollDataType: data.pollDataType,
            archiveTypes: data.archiveTypes,
            schemaEvent: data.schemaEvent,
            schemaEvents: data.schemaEvents,
          },
          text: r.text,
        }

        this.wait = false
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }

      this.edit = true
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter)
    },
    cancelWizard() {
      this.wizard = null
    },
    close() {
      this.edit = false
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'filter') {
        if (data !== null) {
          this.filter = data
          this.get(1, this.pageInfo.Size)
        }
      } else if (name === 'remove') {
        this.remove(
          this.dataItems.filter((r) => r.checked === true).map((r) => r.id)
        )
      }
    },
    changeAll() {
      this.dataItems.forEach((r) => {
        if (r.reset) {
          r.checked = this.all
        }
      })
    },
    async get(page, size) {
      this.wait = true
      try {
        const {
          data: { values, pageInfo },
        } = await this.$http.post(
          'systemMessage/states',
          Object.assign(
            {
              id: this.id,
              type: this.type,
              pageInfo: {
                page,
                size,
              },
            },
            this.filter
          )
        )

        values.forEach((r) => (r.checked = this.all))

        this.dataItems = values

        this.pageInfo = {
          Page: page,
          Items: pageInfo.Items,
          Size: size,
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async remove(ids) {
      this.wait = true
      try {
        const { data } = await this.$http.delete('systemMessage/states', {
          params: { ids },
        })

        if (
          Object.prototype.hasOwnProperty.call(data, 'type') &&
          this.$store.state.env.resultTypes[data.type].type === 'success'
        ) {
          this.dataItems = this.dataItems.filter((r) => !r.checked)
        }

        this.$store.commit('notification', data)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
  },
}
</script>
<style scoped>
.header-box {
  border: solid 1px white;
}
.cell-box {
  justify-content: center;
}
</style>
