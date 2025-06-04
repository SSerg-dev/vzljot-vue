<template>
  <div class="component-detail">
    <tool-bar>
      <div v-if="$store.state.env.dbTypes.dbEquip" :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]" title="Добавить..." @click="onAddClick" />
      <div v-if="$store.state.env.dbTypes.dbEquip" :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected || wait }]" title="Удалить" @click="onRemoveClick()" />
    </tool-bar>
    <div class="table-grid" :style="{ 'grid-template-columns': `repeat(${columnsCount}, max-content)` }">
      <header class="header" />
      <header class="header" v-if="$store.state.user?.userRights.measureSchemeGroupEdit" />
      <header class="header">Наименование</header>
      <header class="header">Данные</header>
      <header class="header">Режимы работы</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon" @click="viewClick(r)">
          <span class="fas fa-file-alt clickable-icon" />
        </span>
        <span class="cell" v-if="$store.state.user?.userRights.equipEdit">
          <input type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell">{{ getText(r) }}</span>
        <span class="cell">{{ getSourceText(r.source) }}</span>
        <span class="cell">{{ getSeasonText(r.season) }}</span>
      </div>
    </div>
    <pager v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка...'" />
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
      <props v-if="formData" :text="`Отчетная форма: ${getText(currentForm)}`" @close="close">
        <form-component v-bind="formData" @loaded="onFormLoaded($event)" />
      </props>
    </transition-group>
  </div>
</template>

<script>
const wizardAdd = value => {
  return {
    name: 'add',
    component: {
      text: 'Создание отчетной формы:',
      component: 'form-params',
      event: 'changed',
      isLast: true,
      data: value
    }
  }
}

const wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление отчетных форм:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить отчетные формы?'
      }
    }
  }
}

import ReportForm from '../../classes/reportForm'

import FormComponent from '../ReportForm/FormComponent.vue'
import ListComponent from '../ListComponent.vue'
import Pager from '../PagerComponent.vue'
import Props from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

export default {
  components: {
    Pager,
    Props,
    FormComponent,
    ToolBar,
    Wizard,
  },
  extends: ListComponent,
  props: {
    id: Number,
    type: String
  },
  data() {
    return {
      forms: {},
      wait: false,
      formData: null,
      wizard: null,
      currentForm: null
    }
  },
  computed: {
    columnsCount() {
      let count = 4

      if (this.$store.state.user?.userRights.measureSchemeGroupEdit) {
        count++
      }

      return count
    },
    filteredItems() {
      return this.dataItems.slice(0).sort((a, b) => {
        if (this.getText(a.name) < this.getText(b.name)) return -1
        if (this.getText(a.name) > this.getText(b.name)) return 1
      })
    }
  },
  async mounted() {
    await this.load(this.id)
  },
  methods: {
    async load(id) {
      this.wait = true
      try {
        const {
          data: { forms, reports }
        } = await this.$http.get('pointReport/reports', { params: { id } })

        this.forms = forms

        if (this.$store.state.user?.userRights && this.$store.state.user?.userRights.measureSchemeEdit) {
          this.dataItems = reports.map(r => Object.assign(r, { checked: false })).sort((a, b) => this.$store.state.collator.compare(a.name, b.name))
        } else {
          this.dataItems = reports
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    onUpdate(item) {
      if (this.$store.state.env.itemTypes[item.type].type === 'pointForm') {
        let prop = this.dataItems.find(r => r.id === item.id)

        if (prop) {
          prop.report = item.report
          prop.pattern = item.pattern
          prop.source = item.source
          prop.season = item.season
          prop.winter = item.winter
          prop.summer = item.summer
          prop.landscape = item.landscape
        } else {
          this.dataItems.push({
            id: item.id,
            report: item.report,
            pattern: item.pattern,
            source: item.source,
            season: item.season,
            winter: item.winter,
            summer: item.summer,
            landscape: item.landscape,
            checked: false
          })
        }
      }
    },
    onDelete(obj) {
      if (this.$store.state.env.itemTypes[obj.type].type === 'pointForm') {
        const index = this.dataItems.findIndex(r => r.id === obj.id)

        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
    onFormLoaded(form) {
      this.currentForm = form
    },
    close() {
      this.formData = null
    },
    onAddClick() {
      const model = {
        reportForm: new ReportForm({
          objectId: this.id,
          type: this.$store.state.env.dbTypes.dbMeasureSchema
        }),
        forms: this.forms
      }
      if (Object.values(this.forms).length > 0) {
        model.reportForm.report = Object.values(this.forms)[0].id
        model.reportForm.source = Object.values(this.forms)[0].sources.reduce((acc, current) => acc + current)
        model.reportForm.pattern = Object.values(this.forms)[0].patterns.length > 0 ? Object.values(this.forms)[0].patterns[0].name : null
      }
      this.wizard = wizardAdd(model)
    },
    viewClick(row) {
      this.formData = {
        id: row.id,
        type: this.matchType(this.$store.state.env.itemTypes).pointForm,
        formType: this.$store.state.env.dbTypes.dbMeasureSchema,
        forms: this.forms
      }
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'remove') {
        this.remove()
      }
    },
    async remove() {
      this.wait = true
      try {
        let values = this.dataItems.filter(r => r.checked).map(r => r.id)
        await this.$http.delete('pointReport/reports', { params: { values } })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    getText(value) {
      let text = ''

      if (value && value.report !== null) {
        text = `${this.forms[value.report].name}${value.pattern ? `, ${value.pattern}` : ''}`
      }

      return text
    },
    getSourceText(source) {
      let text = ''
      Object.keys(this.$store.state.env.reportDataSource).forEach(value => {
        if (source & value && value != this.$store.getters.reversedReportDataSource.all) {
          text += `${text ? ', ' : ''}${this.$store.state.env.reportDataSource[value].text}`
        }
      })
      return text
    },
    getSeasonText(source) {
      let text = ''
      Object.keys(this.$store.state.env.seasonTypes).forEach(value => {
        if (source & value && value != this.$store.getters.reversedSeasonTypes.all) {
          text += `${text ? ', ' : ''}${this.$store.state.env.seasonTypes[value].text}`
        }
      })
      return text
    }
  }
}
</script>
