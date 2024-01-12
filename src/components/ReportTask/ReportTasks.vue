<template>
  <div class="component-detail" style="overflow: visible">
    <tool-bar>
      <div :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]" title="Добавить..." @click="onAddClick" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected || wait }]" title="Удалить" @click="onRemoveClick" />
      <template v-slot:end>
        <div
          :class="['button', 'fas', 'fa-filter', 'remove-sign', { disabled: !hasFilterChanges }]"
          title="Очистить фильтр"
          @click="onClearFilterClick"
        />
        <div :class="['button', 'fas', 'fa-filter']" title="Фильтр..." @click="onFilterClick" />
      </template>
    </tool-bar>
    <div class="table-grid" style="grid-template-columns: repeat(4, max-content)">
      <header class="header"></header>
      <header class="header"><input type="checkbox" v-model="all" @change="changeAll" :disabled="wait" /></header>
      <header class="header">Наименование</header>
      <header class="header">Включено</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div class="fas fa-file-alt clickable-icon" title="Просмотр..." @click="viewClick(r)" />
        </span>
        <span class="cell">
          <input type="checkbox" v-model="r.checked" :disabled="wait" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.active ? 'Да' : 'Нет' }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="spinnerText" />
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" :key="0" />
      <props-component v-if="edit" v-bind="{ uuid: component.uuid, image: component.image, text: `Задание: ${component.name}`}" @close="close" :key="1">
        <task v-bind="component.data" />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import { ReportTask } from '@/classes/reportTask'

const spinnerText = 'Загрузка данных...'

let wizardFilter = filter => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'reportTasksFilter',
      event: 'changed',
      data: {
        filter
      }
    }
  }
}

let wizardAdd = data => {
  return {
    name: 'add',
    component: {
      text: 'Создание задания:',
      component: 'reportTaskProps',
      event: 'changed',
      data
    }
  }
}

let wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление заданий:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные задания?'
      }
    }
  }
}

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import PropsComponent from '../PropsComponent.vue'
import Task from './ReportTask.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

export default {
  name: 'reportTasks',
  components: {
    PagerComponent,
    ToolBar,
    Wizard,
    PropsComponent,
    Task
  },
  extends: ListComponent,
  data() {
    return {
      filter: this.emptyFilter(),
      wait: false,
      spinnerText: spinnerText,
      wizard: null,
      component: {},
      edit: false
    }
  },
  computed: {
    filteredItems() {
      let rows = this.dataItems.slice(0).sort(this.sort)

      if (this.filter.name !== null) {
        rows = rows.filter(r => r.name.toLowerCase().includes(this.filter.name.toLowerCase()))
      }

      if (this.filter.active !== null) {
        rows = rows.filter(r => r.active === this.filter.active)
      }

      return rows
    }
  },
  async mounted() {
    await this.load()
  },
  methods: {
    onUpdate(item) {
      if (this.$store.state.env.itemTypes[item.type].type === 'reportTask') {
        let task = this.dataItems.find(r => r.id === item.id)
        if (task) {
          task.name = item.name
          task.active = item.active
          this.component.name = item.name
        } else {
          this.dataItems.push({
            id: item.id,
            name: item.name,
            active: item.active,
            checked: false
          })
        }
      }
    },
    onDelete(obj) {
      if (this.$store.state.env.itemTypes[obj.type].type === 'reportTask') {
        const index = this.dataItems.findIndex(r => r.id === obj.id)
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
    emptyFilter() {
      return {
        name: null,
        active: null
      }
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter)
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'filter') {
        if (data !== null) {
          this.filter = data
        }
      } else if (name === 'remove') {
        this.remove(this.dataItems.filter(r => r.checked === true).map(r => r.id))
      }
    },
    close() {
      this.edit = false
    },
    onAddClick() {
      this.wizard = wizardAdd({
        task: new ReportTask({}),
        error: this.error
      })
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    viewClick(r) {
      const reportTask = new ReportTask(r)

      this.component = {
        image: reportTask.image,
        name: reportTask.name,
        uuid: reportTask.uuid,
        data: {
          id: reportTask.id,
          uuid: reportTask.uuid
        }
      }

      this.edit = true
    },
    async load() {
      try {
        this.wait = true
        this.spinnerText = spinnerText

        const { data } = await this.$http.get('reportTask/tasks')

        data.forEach(r => (r.checked = this.all))
        this.dataItems = data
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
        await this.$http.delete('reportTask/tasks', { params: { ids } })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    }
  }
}
</script>
