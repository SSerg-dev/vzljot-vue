<template>
  <div class="component-detail">
    <tool-bar>
      <div
        :class="[
          'button',
          'fas',
          'fa-times-circle',
          { disabled: !hasSelected || wait },
        ]"
        title="Удалить"
        @click="onDeleteClick"
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
        'grid-template-columns': `repeat(${columnCount}, max-content)`,
      }"
    >
      <header class="header" />
      <header
        class="header"
        v-if="$store.state.user?.userRights.reportFileEdit"
      >
        <check-box
          class="header-box"
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="wait"
        ></check-box>
      </header>
      <header class="header" />
      <header class="header">Точка учета/прибор</header>
      <header class="header">Отчетная форма</header>
      <header class="header">Задание</header>
      <header class="header">Данные</header>
      <header class="header">Начало</header>
      <header class="header">Окончание</header>
      <header
        class="header"
        v-if="$store.state.user?.userRights.allowCryptSign"
      >
        Подписано
      </header>
      <div v-for="(r, i) in localItems" :key="i" class="table-row">
        <span class="cell icon">
          <div
            :class="'fas fa-paperclip clickable-icon'"
            @click="viewClick(r)"
            title="Просмотр..."
          />
        </span>
        <span class="cell" v-if="$store.state.user?.userRights.reportFileEdit">
          <check-box
            class="cell-box"
            type="checkbox"
            v-model="r.checked"
            :disabled="wait"
          ></check-box>
        </span>
        <span class="cell icon">
          <span
            :class="`${getImage(r)} ${
              r.hasOwnProperty('state')
                ? $store.state.env.statuses[r.state].class
                : ''
            } table-icon`"
          />
        </span>
        <span class="cell">{{ r.objectName }}</span>
        <span class="cell">{{ r.reportName }}</span>
        <span class="cell">{{ r.taskName }}</span>
        <span class="cell">{{
          $store.state.env.reportDataSource[r.source].text
        }}</span>
        <span class="cell">{{ new Date(r.timeStart).toLocaleString() }}</span>
        <span class="cell">{{ new Date(r.timeEnd).toLocaleString() }}</span>
        <span
          class="cell"
          v-if="$store.state.user?.userRights.allowCryptSign"
          >{{ r.subject }}</span
        >
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="spinnerText" />
    <transition-group>
      <div
        v-if="reportDialog"
        style="
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: auto;
          padding: 15px;
          transition: opacity 0.3s ease;
          z-index: 10;
        "
      >
        <div style="position: relative; display: flex; flex: 1">
          <div
            ref="viewer"
            style="
              background: white;
              display: flex;
              overflow: auto;
              flex: 1;
              flex-direction: column;
              width: 100%;
            "
            data-bind="dxReportViewer: $data"
          />
        </div>
      </div>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition-group>
  </div>
</template>

<script>
import '../../assets/report.css'

import ko from 'knockout'
import {
  ActionId,
  PreviewElements,
} from 'devexpress-reporting/dx-webdocumentviewer'
import 'devexpress-reporting/dx-webdocumentviewer'

import 'jquery-ui/themes/base/all.css'
import 'devextreme/dist/css/dx.light.css'
import '@devexpress/analytics-core/dist/css/dx-analytics.common.css'
import '@devexpress/analytics-core/dist/css/dx-analytics.light.css'
import 'devexpress-reporting/dist/css/dx-webdocumentviewer.css'

import axios from 'axios'

import {
  wizardCertificates,
  wizardPassword,
} from '../../plugins/wizardComponents/wizardCertificate'
import { sign } from '../../plugins/crypto/crypto'

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

import CheckBox from '@/components/Inputs/CheckBox.vue'

const CancelToken = axios.CancelToken
let cancel = null

const spinnerText = 'Загрузка данных...'

let wizardDeleteReports = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление отчетов:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные отчеты?',
      },
    },
  }
}

let wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'reportFileListFilter',
      event: 'changed',
      data: {
        filter,
      },
    },
  }
}

let wizardVerify = (id) => {
  return {
    name: 'verify',
    component: {
      text: 'Проверка подписи:',
      component: 'verify',
      data: {
        id,
      },
    },
  }
}

function arrayBufferToBase64(buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  var binary = window.atob(base64)
  var len = binary.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export default {
  components: {
    PagerComponent,
    ToolBar,
    Wizard,
    CheckBox,
  },
  extends: ListComponent,
  props: {
    id: Number,
    type: Number,
  },
  data() {
    return {
      filter: this.emptyFilter(),
      all: false,
      wait: false,
      reportDialog: false,
      reportFile: null,
      spinnerText: spinnerText,
      wizard: null,
      cert: null,
      buttonSignVisible: ko.observable(true),
      buttonVerifyVisible: ko.observable(false),
    }
  },
  computed: {
    columnCount() {
      let count = 10
      if (!this.$store.state.user?.userRights.reportFileEdit) count--
      if (!this.$store.state.user?.userRights.allowCryptSign) count--

      return count
    },
  },
  methods: {
    emptyFilter() {
      return {
        subject: null,
        objectName: null,
        reportName: null,
        taskName: null,
        source: this.$store.getters.reversedReportDataSource.all,
        timeStartFrom: null,
        timeStartTo: null,
        timeEndFrom: null,
        timeEndTo: null,
      }
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter)
    },
    onButtonClick(event) {
      if (typeof this[event] === 'function') {
        this[event]()
      }
    },
    onCloseClick() {
      if (this.reportDialog) {
        this.$refs.viewer.innerHTML = ''
      }
      this.reportDialog = false
    },
    async onVerifyClick() {
      this.wizard = wizardVerify(this.reportFile.id)
    },
    async onSignClick() {
      this.wizard = await wizardCertificates(
        this.$http,
        this.$store.state.user.id
      )
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'remove') {
        this.remove(
          this.dataItems.filter((r) => r.checked === true).map((r) => r.id)
        )
      } else if (name === 'filter') {
        this.filter = data
        this.get(1, this.pageInfo.Size)
      } else if (name === 'certificate') {
        this.cert = data[0]
        if (this.cert.isLocal) {
          this.sign(this.reportFile.id, this.cert)
        } else {
          this.wizard = wizardPassword()
        }
      } else if (name === 'password') {
        this.cert.password = data
        this.sign(this.reportFile.id, this.cert)
      }
    },
    onDeleteClick() {
      this.wizard = wizardDeleteReports()
    },
    onCustomizeElements(s, e) {
      const panelPart = e.GetById(PreviewElements.RightPanel)
      const index = e.Elements.indexOf(panelPart)
      e.Elements.splice(index, 1)
    },
    onCustomizeLocalization(s) {
      s.UpdateLocalization({
        'First Page': 'В начало',
        'Previous Page': 'Предыдущая страница',
        'Next Page': 'Следующая страница',
        'Last Page': 'В конец',
        'Toggle Multipage Mode': 'Многостраничный режим',
        'Zoom Out': 'Уменьшить',
        'Page Width': 'По ширине страницы',
        'Whole Page': 'По размеру страницы',
        'Zoom In': 'Увеличить',
        Print: 'Печатать',
        'Print Page': 'Печатать страницу',
        'Export To': 'Экспортировать',
        Search: 'Поиск',
        'Full Screen': 'На весь экран',
        'Creating the document...': 'Создание отчета...',
        'Loading...': 'Получение данных...',
        'The document does not contain any pages.':
          'Отчет не содержит ни одной страницы.',
        'The document is printed.': 'Отчет отправлен на печать.',
        'If nothing prints, or the printout is incorrect,':
          'Если ничего не напечаталось,',
        'open the printable PDF file.': 'откройте PDF-файл',
        Cancel: 'Отмена',
      })
    },
    onCustomizeMenuActions(s, e) {
      // eslint-disable-next-line no-extra-semi
      ;[ActionId.HighlightEditingFields, ActionId.Search].forEach((r) => {
        const action = e.GetById(r)
        if (action) action.visible = false
      })

      const actionFullScreen = e.GetById(ActionId.FullScreen)
      if (actionFullScreen) {
        actionFullScreen.hasSeparator = true
      }

      if (this.$store.state.user?.userRights.allowCryptSign) {
        e.Actions.push({
          text: 'Проверить подпись...',
          imageClassName: 'report-key',
          visible: this.buttonVerifyVisible,
          disabled: false,
          selected: false,
          hasSeparator: true,
          clickAction: () => {
            this.wizard = wizardVerify(this.reportFile.id)
            this.viewWizard = true
          },
        })

        e.Actions.push({
          text: 'Подписать отчет...',
          imageClassName: 'report-lock-alt',
          visible: this.buttonSignVisible,
          disabled: false,
          selected: false,
          hasSeparator: true,
          clickAction: async () => {
            this.wizard = await wizardCertificates(
              this.$http,
              this.$store.state.user.id
            )
            this.viewWizard = true
          },
        })
      }

      const buttonClose = {
        text: 'Закрыть отчет',
        imageClassName: 'report-close',
        visible: true,
        disabled: false,
        selected: false,
        hasSeparator: false,
        clickAction: () => {
          this.reportDialog = false
          if (this.$refs.viewer) {
            this.reportFile = null
            ko.cleanNode(this.$refs.viewer)
          }
        },
      }

      e.Actions.push(buttonClose)
    },
    async viewClick(reportFile) {
      this.wait = true
      this.spinnerText = spinnerText

      try {
        this.reportFile = reportFile

        const viewerOptions = {
          reportUrl: ko.observable(
            JSON.stringify({
              type: 'file',
              user: this.$store.state.user.name,
              param: JSON.stringify({ id: reportFile.id }),
            })
          ),
          requestOptions: {
            host: `${window.location.origin}`,
            invokeAction: `${window.props.baseUrl}DXXRDV`,
          },
          callbacks: {
            CustomizeElements: this.onCustomizeElements,
            CustomizeMenuActions: this.onCustomizeMenuActions,
            CustomizeLocalization: this.onCustomizeLocalization,
          },
        }

        this.buttonSignVisible(!this.reportFile.isSigned)
        this.buttonVerifyVisible(this.reportFile.isSigned)

        this.reportDialog = true

        await this.$nextTick()

        ko.applyBindings(viewerOptions, this.$refs.viewer)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async get(page, size) {
      this.wait = true

      try {
        const {
          data: { list, pageInfo },
        } = await this.$http.post('reportFile/reportFiles', {
          id: this.id,
          type: this.type,
          subject: this.filter.subject,
          objectName: this.filter.objectName,
          reportName: this.filter.reportName,
          taskName: this.filter.taskName,
          source: this.filter.source,
          timeStartFrom: this.filter.timeStartFrom,
          timeStartTo: this.filter.timeStartTo,
          timeEndFrom: this.filter.timeEndFrom,
          timeEndTo: this.filter.timeEndTo,
          pageInfo: {
            page,
            size,
          },
        })

        this.dataItems = list.map((r) => Object.assign(r, { checked: false }))

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
      this.spinnerText = 'Удаление...'
      try {
        const { data, status } = await this.$http.delete(
          'reportFile/reportFiles',
          {
            params: { ids },
          }
        )
        if (data) {
          this.$store.commit('notification', data)
        }
        if (this.$store.state.env.resultTypes[data.type]?.type === 'success') {
          this.get(this.pageInfo.Page, this.pageInfo.Size, ids)
        }
        if (status === 200) {
          this.get(this.pageInfo.Page, this.pageInfo.Size, ids)
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async sign(id, certificate) {
      this.wait = true
      this.spinnerText = 'Подпись отчета...'
      try {
        if (certificate.isLocal) {
          let res = await this.$http({
            url: 'reportFile/reportPdf',
            data: { id },
            method: 'POST',
            responseType: 'blob',
          })

          const blob = new Blob([res.data], {
            type: res.headers['content-type'],
          })

          const signedData = await sign(
            certificate.subject,
            arrayBufferToBase64(await blob.arrayBuffer())
          )

          const decoded = base64ToArrayBuffer(signedData)

          const signedBlob = new Blob([decoded], { type: 'application/pdf' })

          const formData = new FormData()

          formData.set('id', id)
          formData.set('formFile', signedBlob)

          await this.$http({
            method: 'post',
            url: 'reportFile/sign',
            data: formData,
            header: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            cancelToken: new CancelToken(function (c) {
              cancel = c
            }),
          })
        } else {
          await this.$http.post(
            'reportFile/signCert',
            { id, certificate },
            {
              cancelToken: new CancelToken(function (c) {
                cancel = c
              }),
            }
          )
        }

        this.reportFile.isSigned = true
        this.reportFile.subject = certificate.subject

        this.buttonSignVisible(false)
        this.buttonVerifyVisible(true)

        this.$store.commit('notification', {
          title: 'Подпись отчета',
          type: 0,
          text: 'Отчет подписан.',
        })
      } catch (e) {
        if (e.response) {
          if (e.response.data.type === 'error') {
            this.$store.commit('error', e.response.data.message)
          } else {
            this.$store.commit('notification', {
              title: 'Подпись отчета',
              type: 1,
              text: e.response.data.message,
            })
          }
        } else {
          this.$store.commit('error', e)
        }
      } finally {
        this.wait = false
      }
    },
    cancel() {
      cancel('Операция отменена пользователем.')
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
