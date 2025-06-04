<template>
  <div class="component-detail">
    <toolbar>
      <label v-if="userRight" style="margin: 0">
        <input
          type="file"
          multiple
          style="display: none"
          @change="handleFiles($event.target.files)"
        />
        <div
          :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]"
          title="Добавить..."
        />
      </label>
      <div
        v-if="userRight"
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
    </toolbar>
    <div
      class="table-grid"
      :style="{
        'grid-template-columns': `repeat(${
          userRight ? '7' : '6'
        }, max-content)`,
      }"
    >
      <header class="header" />
      <header class="header" />
      <header class="header" v-if="userRight">
        <check-box
          class="header-box"
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="wait"
        ></check-box>
      </header>
      <header class="header">Наименование</header>
      <header class="header">Дата изменения</header>
      <header class="header">Тип файла</header>
      <header class="header">Размер файла, байт</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div
            :class="'fas fa-paperclip clickable-icon'"
            @click="viewClick(r.id, true)"
            title="Просмотр..."
          />
        </span>
        <span class="cell icon">
          <div
            :class="'fas fa-download clickable-icon'"
            @click="viewClick(r.id, false)"
            title="Загрузка..."
          />
        </span>
        <span class="cell cell-box" v-if="userRight">
          <check-box
            type="checkbox"
            v-model="r.checked"
            :disabled="wait"
          ></check-box>
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{
          r.timeChanged ? new Date(r.timeChanged).toLocaleDateString() : ''
        }}</span>
        <span class="cell">{{ r.type }}</span>
        <span class="cell">{{ r.size }}</span>
      </div>
    </div>
    <pager v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="waitText" />
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
const wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'fileFilter',
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
      text: 'Удаление файлов:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные файлы?',
      },
    },
  }
}

import Export from '../../plugins/export'

const spinnerText = 'Загрузка...'

import ListComponent from '../ListComponent.vue'
import Pager from '../PagerComponent.vue'
import Toolbar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

import CheckBox from '@/components/Inputs/CheckBox.vue'

export default {
  components: {
    Pager,
    Toolbar,
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
      formFilter: null,
      wait: false,
      waitText: spinnerText,
      all: false,
      wizard: null,
      fileReaderWorker: new Worker(
        new URL('../../plugins/workers/file.worker.js', import.meta.url)
      ),
      exporter: new Export(this.$http),
    }
  },
  computed: {
    userRight() {
      if (this.type === 'DbMeasureScheme')
        return this.$store.state.user?.userRights.measureSchemeEdit
      if (this.type === 'DbEquip')
        return this.$store.state.user?.userRights.equipEdit
      if (this.type === 'DbNode')
        return this.$store.state.user?.userRights.measureSchemeEdit
      return false
    },
  },
  mounted() {
    this.fileReaderWorker.onmessage = (r) => {
      if (r.data.message === 'fileEnd') {
        let splittedName = r.data.file.name.split('.')
        let ext = splittedName.length > 1 ? splittedName.pop() : ''
        this.dataItems.push({
          id: r.data.id,
          type: ext,
          name: splittedName.join('.'),
          timeChanged: r.data.file.lastModified,
          size: r.data.file.size,
          checked: false,
        })
      } else if (r.data.message === 'progress') {
        this.wait = true
        this.waitText = `Сохранение '${r.data.fileName}' - ${r.data.percent}%`
      } else if (r.data.message === 'end') {
        this.wait = false
        this.waitText = spinnerText
      } else if (r.data.message === 'error') {
        this.wait = false
        this.$store.commit('error', r.data.error)
      }
    }
    this.$nextTick().then(() => this.get(1, this.pageInfo.Size))
  },
  methods: {
    emptyFilter() {
      return {
        type: null,
        name: null,
        timeChanged: null,
      }
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter)
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
        this.remove(
          this.dataItems.filter((r) => r.checked).map((r) => r.id),
          this.type
        )
      } else if (name === 'filter') {
        this.filter = data
        this.get(1, this.pageInfo.Size)
      }
    },
    async viewClick(id, view) {
      this.wait = true
      try {
        await this.exporter.get('fileList/file', { id, type: this.type }, view)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    get(page, size) {
      this.wait = true

      this.$http
        .post(`fileList/files`, {
          id: this.id,
          type: this.type,
          fileType: this.filter.type,
          name: this.filter.name,
          timeChanged: this.filter.timeChanged,
          pageInfo: {
            page: page,
            size: size,
          },
        })
        .then(({ data }) => {
          this.dataItems = data.values.map((r) => {
            return Object.assign(r, {
              checked: false,
            })
          })
          this.pageInfo = {
            Page: page,
            Items: data.pageInfo.Items,
            Size: size,
          }
        })
        .catch((error) => this.$store.commit('error', error))
        .finally(() => (this.wait = false))
    },
    async remove(files, type) {
      this.wait = true
      try {
        await this.$http.delete('fileList/files', { params: { files, type } })
        this.get(this.pageInfo.Page, this.pageInfo.Size)
        this.all = false
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    handleFiles(files) {
      this.fileReaderWorker.postMessage({
        id: this.id,
        type: this.type,
        files: [...files],
        baseUrl: window.props.baseUrl,
      })
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
