<template>
  <div class="component-detail">
    <tool-bar>
      <div
        :class="[
          'button',
          'fas',
          'fa-envelope',
          { disabled: !hasSelected || wait },
        ]"
        title="Квитировать"
        @click="onConfirmClick()"
      />
      <div
        :class="[
          'button',
          'fas',
          'fa-times-circle',
          { disabled: !hasSelected || wait },
        ]"
        title="Удалить"
        @click="onRemoveClick()"
      />
      <template v-slot:end>
        <label>
          <check-box class="menu-box" type="checkbox" v-model="isConfirm">
          </check-box>
          Не квитированные
        </label>
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
        'grid-template-columns': `repeat(${
          $store.state.user?.userRights.analyse ? 9 : 8
        }, max-content)`,
      }"
    >
      <header
        v-if="$store.state.user?.userRights.analyse"
        class="header"
      ></header>
      <header class="header">
        <check-box
          class="header-box"
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="wait"
        ></check-box>
      </header>
      <header class="header">Получение</header>
      <header class="header">Тип объекта</header>
      <header class="header">Объект</header>
      <header class="header">Сообщение</header>
      <header class="header">Статус</header>
      <header class="header">Возникновение</header>
      <header class="header">Источник</header>
      <div v-for="(r, i) in localItems" :key="i" class="table-row">
        <span v-if="$store.state.user?.userRights.analyse" class="cell icon">
          <div
            :class="r.hasAnalyze ? 'fas fa-chart-pie clickable-icon' : ''"
            @click="viewClick(r)"
            title="Просмотр..."
          />
        </span>
        <span class="cell cell-box">
          <check-box
            type="checkbox"
            v-model="r.checked"
            :disabled="wait"
          ></check-box>
        </span>
        <span :class="['cell', { isConfirm: r.isConfirm }]">{{
          new Date(r.timeRecive).toLocaleString()
        }}</span>
        <span :class="['cell', { isConfirm: r.isConfirm }]">{{
          r.objectTypeText
        }}</span>
        <span :class="['cell', { isConfirm: r.isConfirm }]">{{
          r.objectText
        }}</span>
        <span :class="['cell', { isConfirm: r.isConfirm }]">{{
          r.message
        }}</span>
        <span :class="['cell', { isConfirm: r.isConfirm }]">{{
          r.status
        }}</span>
        <span :class="['cell', { isConfirm: r.isConfirm }]">{{
          r.timeEvent ? new Date(r.timeEvent).toLocaleString() : ''
        }}</span>
        <span :class="['cell', { isConfirm: r.isConfirm }]">{{
          r.sourceText
        }}</span>
      </div>
    </div>
    <pager v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка...'" />
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
      <props v-if="edit" :text="`Анализ: ${component.text}`" @close="close">
        <component :is="component.name" v-bind="component.data" />
      </props>
    </transition-group>
  </div>
</template>

<script>
import axios from 'axios'
import { asyncImport } from '../../plugins/api'

const CancelToken = axios.CancelToken
let cancel = null

const wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'SystemMessagesFilter',
      event: 'changed',
      data: {
        filter,
      },
    },
  }
}

let wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление уведомлений:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные уведомления?',
      },
    },
  }
}

let wizardConfirm = () => {
  return {
    name: 'confirm',
    component: {
      text: 'Квитирование уведомлений:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите квитировать выбранные уведомления?',
      },
    },
  }
}

import ListComponent from '../ListComponent.vue'
import Pager from '../PagerComponent.vue'
import Props from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'

export default {
  components: {
    Analyze: asyncImport(() => import('../Analyze/AnalyzeComponent.vue')),
    Temperature: asyncImport(() =>
      import('../Analyze/TemperatureComponent.vue')
    ),
    Props,
    Pager,
    ToolBar,
    Wizard,
    CheckBox,
  },
  extends: ListComponent,
  props: {
    objectId: Number,
    objectType: String,
  },
  data() {
    return {
      filter: this.emptyFilter(),
      wizard: null,
      wait: false,
      isConfirm: true,
      edit: false,
      all: false,
      component: {
        name: null,
        data: null,
        text: null,
      },
    }
  },
  beforeUnmount() {
    if (cancel) this.cancel()
  },
  watch: {
    isConfirm() {
      this.get(1, this.pageInfo.Size)
    },
  },
  methods: {
    emptyFilter() {
      return {
        timeRecieveStart: null,
        timeRecieveEnd: null,
        objectTypeText: null,
        objectText: null,
        message: null,
        status: null,
        timeEventStart: null,
        timeEventEnd: null,
        sourceText: null,
      }
    },
    async viewClick(r) {
      this.wait = true
      try {
        const { data } = await this.$http.get('systemMessage/message', {
          params: { id: r.messageId },
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
                  new Date().getDate(),
                  0,
                  0,
                  0
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
          text: r.objectText,
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
    onConfirmClick() {
      this.wizard = wizardConfirm()
    },
    async get(page, size) {
      this.wait = true
      try {
        const model = Object.assign(
          {
            id: this.$store.state.user.id,
            objectId: this.objectId,
            objectType: this.objectType,
            isConfirm: this.isConfirm,
            pageInfo: {
              page,
              size,
            },
          },
          this.filter
        )

        const { data } = await this.$http.post(
          'systemMessage/messages',
          model,
          {
            cancelToken: new CancelToken(function executor(c) {
              cancel = c
            }),
          }
        )

        data.values.forEach((r) => (r.checked = this.all))

        this.dataItems = data.values

        this.pageInfo = {
          Page: page,
          Items: data.pageInfo.Items,
          Size: size,
        }

        this.wait = false
      } catch (error) {
        if (axios.isCancel(error)) {
          cancel = null
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.wait = false
      }
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

      if (name === 'remove') {
        this.remove(
          this.dataItems.filter((r) => r.checked === true).map((r) => r.id)
        )
      } else if (name === 'confirm') {
        this.confirm(
          this.dataItems.filter((r) => r.checked === true).map((r) => r.id)
        )
      } else if (name === 'filter' && data) {
        this.filter = data
        this.get(1, this.pageInfo.Size)
      }
    },
    async confirm(ids) {
      this.wait = true
      this.spinnerText = 'Квитирование...'
      try {
        await this.$http.patch('systemMessage/confirm', { ids })
        this.get(1, this.pageInfo.Size)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async remove(ids) {
      this.wait = true
      this.spinnerText = 'Удаление...'
      try {
        await this.$http.delete('systemMessage/messages', { params: { ids } })
        this.get(1, this.pageInfo.Size)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    cancel() {
      cancel('Операция отменена.')
    },
  },
}
</script>

<style scoped>
.isConfirm {
  color: darkgrey;
}
.menu-box {
  cursor: pointer;
  justify-content: center;
}
.header-box {
  border: solid 1px white;
}
.cell-box {
  justify-content: center;
}
</style>
