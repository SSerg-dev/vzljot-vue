<template>
  <div class="wrapper">
    <div ref="viewer" data-bind="dxReportViewer: $data" />
    <transition>
      <wizard
        v-if="viewWizard"
        v-bind="wizard"
        @cancel="onWizardCancel"
        @end="onWizardEnd"
        :background="background"
        :cancellable="localCancellable" 
      />
    </transition>
    <spinner :show="wait" :text="spinnerText" />
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
import { store } from '@/store/store'
import {
  wizardCertificates,
  wizardPassword,
} from '../../plugins/wizardComponents/wizardCertificate'
import { sign } from '../../plugins/crypto/crypto'

import Export from '../../plugins/export'
import { getISODateTime } from '../../plugins/api.js'

import Wizard from '../Wizard.vue'

const spinnerText = 'Загрузка данных...'

const CancelToken = axios.CancelToken

let cancel = null

const reportParams = (items, objType, reportType) => {
  return {
    name: 'reportParams',
    text: 'Параметры отчета:',
    component: 'report-params',
    event: 'saved',
    isLast: true,
    data: {
      items,
      objType,
      reportType,
    },
  }
}

const reportMoek = (items) => {
  return {
    name: 'reportMoek',
    text: 'Параметры отчета:',
    component: 'report-moek',
    event: 'saved',
    isLast: true,
    data: {
      id: items[0],
    },
  }
}

const reportPassport = (items, objType) => {
  return {
    name: 'reportPassport',
    text: 'Параметры отчета:',
    component: 'report-passport',
    event: 'saved',
    isLast: true,
    data: {
      items: items,
      objType: objType,
    },
  }
}

const wizardParams = (items, objType, reportTypes) => {
  let data = {
    name: 'reportWizard',
    component: null,
  }

  if (reportTypes) {
    if (reportTypes.length > 0) {
      if (reportTypes.length > 1) {
        data.component = {
          text: 'Выберите тип отчета:',
          component: 'selector-option',
          event: 'selectionChanged',
          data: {
            options: reportTypes.map((r) => store.state.env.reportTypes[r]),
            defaultOption: store.state.env.reportTypes[reportTypes[0]],
          },
          next(data) {
            let filter = null

            switch (data) {
              case 'moek':
                filter = reportMoek(items)
                break
              case 'passport':
                filter = reportPassport(items, objType)
                break
              default:
                filter = reportParams(items, objType, data)
                break
            }

            return filter
          },
        }
      } else {
        data.component = reportParams(
          items,
          objType,
          store.state.env.reportTypes[reportTypes[0]].type
        )
      }
    }
  }

  return data
}

const wizardVerify = (id) => {
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
    Wizard,
  },
  props: {
    ids: Array,
    objType: Number,
    reportTypes: {
      type: Array,
      default: () => [],
    },
    background: {
      type: String,
      default: 'rgba(169, 175, 183, 0.7)',
    },
    cancellable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let filter = wizardParams(this.ids, this.objType, this.reportTypes)
    return {
      filterData: null,
      viewWizard: true,
      wizardFilter: filter,
      wizard: filter,
      wait: false,
      spinnerText: spinnerText,
      hasReport: false,
      reportFile: null,
      localCancellable: this.cancellable,
      cert: null,
      exporter: new Export(this.$http),
      buttonSignVisible: ko.observable(true),
      buttonVerifyVisible: ko.observable(false),
    }
  },
  created() {
    this.$watch(
      () => this.reportTypes,
      () => {
        this.wizardFilter = wizardParams(
          this.ids,
          this.objType,
          this.reportTypes
        )
        this.wizard = wizardParams(this.ids, this.objType, this.reportTypes)
      }
    )
  },
  beforeUnmount() {
    ko.cleanNode(this.$refs.viewer)
  },
  methods: {
    async sign(parameters, certificate) {
      this.wait = true
      this.spinnerText = 'Подпись отчета...'

      try {
        if (certificate.isLocal) {
          const res = await this.$http({
            url: 'report/reportPdf',
            data: parameters,
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
          Object.keys(parameters).forEach((r) => formData.set(r, parameters[r]))

          formData.set('items', JSON.parse(parameters.items))
          formData.set(
            'periodStart',
            getISODateTime(new Date(parameters.periodStart))
          )
          formData.set(
            'periodEnd',
            getISODateTime(new Date(parameters.periodEnd))
          )
          formData.set('formFile', signedBlob)

          const { data } = await this.$http({
            method: 'post',
            url: 'report/sign',
            data: formData,
            header: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
          })
          this.reportFile = data
        } else {
          const { data } = await this.$http.post(
            'report/signCert',
            { ...parameters, certificate },  
            {
              cancelToken: new CancelToken(function (c) {
                cancel = c
              }),
            }
          )

          this.reportFile = data 
        }

        this.$store.commit('notification', {
          title: 'Подпись отчета',
          type: 0,
          text: 'Отчет подписан.',
        })

        this.buttonSignVisible(false)
        this.buttonVerifyVisible(true)
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
    onWizardCancel(data) {
      this.viewWizard = false
      if (
        data &&
        data.type &&
        this.$store.state.env.resultTypes[data.type].type === 'error'
      ) {
        this.$store.commit('notification', {
          title: 'Формирование отчета',
          type: 'error',
          text: data.text,
        })
      }
      this.$emit('cancel', this.hasReport)
    },
    onDocumentReady() {
      this.hasReport = true
      this.$emit('reportLoaded')
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
    onCustomizeReportMenuActions(s, e) {
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

      const buttonParams = {
        id: 'params',
        text: 'Параметры отчета',
        imageClassName: 'report-cog',
        visible: true,
        disabled: false,
        selected: false,
        hasSeparator: true,
        clickAction: () => {
          this.wizard = this.wizardFilter
          this.viewWizard = true
        },
      }

      const buttonClose = {
        text: 'Закрыть отчет',
        imageClassName: 'report-close',
        visible: true,
        disabled: false,
        selected: false,
        hasSeparator: false,
        clickAction: () => {
          if (this.$refs.viewer) {
            this.$refs.viewer.innerHTML = ''
          }
          this.localCancellable = false
          this.wizardFilter = wizardParams(
            this.ids,
            this.objType,
            this.reportTypes
          )
          this.wizard = this.wizardFilter
          this.viewWizard = true
          this.$emit('close')
        },
      }

      e.Actions.push(buttonParams, buttonClose)
    },
    onCustomizePassportMenuActions(s, e) {
      // eslint-disable-next-line no-extra-semi
      ;[ActionId.HighlightEditingFields, ActionId.Search].forEach((r) => {
        const action = e.GetById(r)
        if (action) action.visible = false
      })

      const actionFullScreen = e.GetById(ActionId.FullScreen)
      if (actionFullScreen) {
        actionFullScreen.hasSeparator = true
      }

      const buttonParams = {
        id: 'params',
        text: 'Параметры отчета',
        imageClassName: 'report-cog',
        visible: true,
        disabled: false,
        selected: false,
        hasSeparator: true,
        clickAction: () => {
          this.wizard = this.wizardFilter
          this.viewWizard = true
        },
      }

      const buttonClose = {
        text: 'Закрыть отчет',
        imageClassName: 'report-close',
        visible: true,
        disabled: false,
        selected: false,
        hasSeparator: false,
        clickAction: () => {
          if (this.$refs.viewer) {
            this.$refs.viewer.innerHTML = ''
          }
          this.localCancellable = false
          this.wizardFilter = wizardParams(
            this.ids,
            this.objType,
            this.reportTypes
          )
          this.wizard = this.wizardFilter
          this.viewWizard = true
          this.$emit('close')
        },
      }

      e.Actions.push(buttonParams, buttonClose)
    },
    async onWizardEnd(value, wizardName, componentName) {
      if (wizardName === 'reportWizard') {
        this.wait = true
        this.spinnerText = spinnerText
        try {
          this.filterData = value

          if (componentName === 'report-params') {
            if (this.$store.state.user?.userRights.allowCryptSign) {
              const { data } = await this.$http.post(
                'report/reportFile',
                value,
                {
                  cancelToken: new CancelToken(function executor(c) {
                    cancel = c
                  }),
                }
              )
              this.reportFile = data
            }

            this.buttonSignVisible(this.reportFile === null)
            this.buttonVerifyVisible(
              this.reportFile !== null && this.reportFile.hasFile
            )

            const viewerOptions = {
              reportUrl: ko.observable(
                JSON.stringify({
                  type: 'report',
                  user: this.$store.state.user.name,
                  param: JSON.stringify(value),
                })
              ),
              requestOptions: {
                host: `${window.location.origin}`,
                invokeAction: `${window.props.baseUrl}DXXRDV`,
              },
              callbacks: {
                CustomizeElements: this.onCustomizeElements,
                CustomizeMenuActions: this.onCustomizeReportMenuActions,
                CustomizeLocalization: this.onCustomizeLocalization,
                DocumentReady: this.onDocumentReady,
              },
            }

            ko.cleanNode(this.$refs.viewer)
            ko.applyBindings(viewerOptions, this.$refs.viewer)

            this.viewWizard = false
            this.localCancellable = true

            // export to file
            // value.exportType = 'pdf'
            // const res = await this.$http({
            //   url: 'report/export',
            //   data: value,
            //   method: 'POST',
            //   responseType: 'blob',
            //   cancelToken: new CancelToken(function(c) {
            //     cancel = c
            //   })
            // })
            // if (res && res.data && res.data.size > 0) {
            //   const blob = new Blob([res.data], { type: res.headers['content-type'] })
            //   const fileName = matcher.contentDescriptionFileName.exec(decodeURIComponent(res.headers['content-disposition']))[1]
            //   this.exporter.exportBlob(blob, fileName)
            // }
            //end export to file
          } else if (componentName === 'report-passport') {
            const viewerOptions = {
              reportUrl: ko.observable(
                JSON.stringify({
                  type: 'report',
                  user: this.$store.state.user.name,
                  param: JSON.stringify(value),
                })
              ),
              requestOptions: {
                host: `${window.location.origin}`,
                invokeAction: `${window.props.baseUrl}DXXRDV`,
              },
              callbacks: {
                CustomizeElements: this.onCustomizeElements,
                CustomizeMenuActions: this.onCustomizePassportMenuActions,
                CustomizeLocalization: this.onCustomizeLocalization,
                DocumentReady: this.onDocumentReady,
              },
            }

            ko.cleanNode(this.$refs.viewer)
            ko.applyBindings(viewerOptions, this.$refs.viewer)

            this.viewWizard = false
            this.localCancellable = true
          } else if (componentName === 'report-moek') {
            try {
              await this.exporter.post(`moek/report`, value)

              this.localCancellable = this.cancellable
              this.wizardFilter = wizardParams(
                this.ids,
                this.objType,
                this.reportTypes
              )
              this.wizard = this.wizardFilter
              this.viewWizard = true
            } catch (error) {
              if (error.response.status === 550) {
                this.$store.commit('notification', {
                  title: 'Формирование отчета',
                  type: 'error',
                  text: JSON.parse(await error.response.data.text()).message,
                })
              } else {
                this.$store.commit('error', error)
              }
            }
          }
        } catch (error) {
          if (error.response.status === 551) {
            this.$store.commit('notification', {
              title: 'Формирование отчета',
              type: 'error',
              text: await error.response.data.text(),
            })
          } else {
            this.$store.commit('error', error)
          }
        } finally {
          this.wait = false
        }
      } else if (wizardName === 'verify') {
        this.viewWizard = false
      } else if (wizardName === 'certificate') {
        this.cert = value[0]
        if (this.cert.isLocal) {
          this.viewWizard = false
          this.sign(this.filterData, this.cert)
        } else {
          this.wizard = wizardPassword()
        }
      } else if (wizardName === 'password') {
        this.viewWizard = false
        this.cert.password = value
        this.sign(this.filterData, this.cert)
      }
    },
    cancel() {
      cancel('Операция отменена пользователем.')
    },
  },
}
</script>

<style scoped>
.wrapper {
  display: grid;
  flex: 1;
  overflow: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
