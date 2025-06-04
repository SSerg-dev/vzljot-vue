<template>
  <div class="component-detail">
    <tool-bar>
      <div
        :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]"
        title="Добавить..."
        @click="onAddClick()"
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
        <div
          :class="[
            'button',
            'fas',
            'fa-filter',
            'remove-sign',
            { disabled: !hasFilterChanges },
          ]"
          title="Очистить фильтр"
          @click="onClearFilterClick()"
        />
        <div
          :class="['button', 'fas', 'fa-filter']"
          title="Фильтр..."
          @click="onFilterClick()"
        />
      </template>
    </tool-bar>
    <div
      class="table-grid"
      :style="{ 'grid-template-columns': `repeat(6, max-content)` }"
    >
      <header class="header" />
      <header class="header">
        <input
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="wait"
        />
      </header>
      <header class="header">Наименование</header>
      <header class="header">Группа</header>
      <header class="header">Заблокирован?</header>
      <header class="header">Примечание</header>
      <div v-for="(r, i) in localItems" :key="i" class="table-row">
        <span class="cell icon">
          <div
            :class="`${getImage(r)} clickable-icon`"
            style="position: relative"
            @click="viewClick(r)"
            title="Просмотр..."
          />
        </span>
        <span class="cell">
          <input
            v-if="r.name !== $store.state.env.adminName"
            type="checkbox"
            v-model="r.checked"
            :disabled="wait"
          />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ getGroups(r.groups) }}</span>
        <span class="cell">{{ r.enabled ? 'Нет' : 'Да' }}</span>
        <span class="cell">{{ r.desc }}</span>
      </div>
    </div>
    <pager v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="spinnerText" />
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
      <props
        v-if="edit"
        :text="`Пользователь: ${componentText}`"
        @close="close"
      >
        <user-component v-bind="componentData" @fullNameChange="onUserEvent" />
      </props>
    </transition-group>
  </div>
</template>

<script>
import { asyncImport, getImage } from '../../plugins/api.js'

const abortController = new AbortController()

const spinnerText = 'Загрузка данных...'

let wizardFilter = (filter, groups) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'usersFilter',
      event: 'changed',
      data: {
        filter,
        groups,
      },
    },
  }
}

let wizardAdd = (value) => {
  return {
    name: 'add',
    component: {
      text: 'Создание пользователя:',
      component: 'user-props',
      event: 'change',
      data: value,
    },
  }
}

let wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление пользователей:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранных пользователей?',
      },
    },
  }
}

import User from '../../classes/user'

import ListComponent from '../ListComponent.vue'
import Pager from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'
import Props from '../PropsComponent.vue'

export default {
  name: 'usersList',
  components: {
    Pager,
    ToolBar,
    Wizard,
    Props,
    UserComponent: asyncImport(() => import('./UserComponent.vue')),
  },
  extends: ListComponent,
  data() {
    return {
      filter: this.emptyFilter(),
      wait: false,
      spinnerText: spinnerText,
      wizard: null,
      componentData: null,
      componentText: null,
      edit: false,
      all: false,
    }
  },
  computed: {
    filteredItems() {
      this.dataItems.forEach((r) => r.groups.sort(this.sort))

      let rows = this.dataItems.slice(0).sort(this.sort)

      if (this.filter.name !== null) {
        rows = rows.filter((r) =>
          r.name.toLowerCase().includes(this.filter.name.toLowerCase())
        )
      }

      if (this.filter.groups !== null) {
        rows = rows.filter((r) =>
          r.groups.map((x) => x.userGroupId).includes(this.filter.groups)
        )
      }

      if (this.filter.desc !== null) {
        rows = rows.filter((r) =>
          r.desc
            ? r.desc.toLowerCase().includes(this.filter.desc.toLowerCase())
            : false
        )
      }

      if (this.filter.enabled) {
        rows = rows.filter((r) =>
          this.filter.enabled === 'true' ? r.enabled : !r.enabled
        )
      }

      return rows
    },
  },
  async mounted() {
    this.$emitter.on('message', this.processMessage)

    await this.load()
  },
  beforeUnmount() {
    this.$emitter.on('updateObject', this.onUpdate)
    this.$emitter.on('deleteObject', this.onDelete)

    abortController.abort()
  },
  methods: {
    getGroups(groups) {
      return groups.map((r) => r.name).join('; ')
    },
    getImage(item) {
      return getImage.call(this, item) + (item.online ? ' online' : '')
    },
    onUpdate(item) {
      if (this.$store.state.env.itemTypes[item.type].type === 'user') {
        let user = this.dataItems.find((r) => r.id === item.id)
        if (user) {
          user.name = item.name
          user.groups = item.groups
          user.desc = item.desc
        } else {
          this.dataItems.push({
            id: item.id,
            type: item.type,
            name: item.name,
            groups: item.groups,
            desc: item.desc,
            checked: false,
            online: false,
          })
        }
      } else if (
        this.$store.state.env.itemTypes[item.type].type === 'userGroupItem'
      ) {
        const user = this.dataItems.find((r) => r.id === item.userId)
        if (user) {
          if (user.groups.filter((r) => r.id === item.id).length === 0) {
            user.groups.push({
              id: item.id,
              userGroupId: item.userGroupId,
              name: item.name,
            })
          }
        }
      }
    },
    onDelete(obj) {
      if (this.$store.state.env.itemTypes[obj.type].type === 'user') {
        const index = this.dataItems.findIndex((r) => r.id === obj.id)
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      } else if (
        this.$store.state.env.itemTypes[obj.type].type === 'userGroupItem'
      ) {
        const user = this.dataItems.find((r) =>
          r.groups.map((x) => x.id).includes(obj.id)
        )

        if (user) {
          const index = user.groups.findIndex((r) => r.id === obj.id)
          if (index >= 0) {
            user.groups.splice(index, 1)
          }
        }
      }
    },
    onUserEvent(value) {
      this.componentText = value
    },
    emptyFilter() {
      return {
        name: null,
        groups: null,
        desc: null,
        enabled: null,
      }
    },
    async onFilterClick() {
      const { data } = await this.$http.get('user/groups')
      this.wizard = wizardFilter(this.filter, data)
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
        this.remove(
          this.dataItems.filter((r) => r.checked === true).map((r) => r.id)
        )
      } else if (name === 'edit') {
        let user = this.dataItems.find((r) => r.id === data.id)
        if (user) {
          Object.entries(data).forEach(([key, value]) => {
            if (Object.prototype.hasOwnProperty.call(user, key)) {
              user[key] = value
            }
          })
        }
      }
    },
    close() {
      this.edit = false
    },
    onAddClick() {
      this.wizard = wizardAdd({
        user: new User(),
      })
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    viewClick(r) {
      this.componentData = {
        creator: this.$options.name,
        id: r.id,
        type: this.matchType(this.$store.state.env.itemTypes).user,
      }
      this.componentText = r.name
      this.$store.state.equip.userId = r.id
      this.edit = true
    },
    changeAll() {
      this.dataItems.forEach((r) => {
        if (r.name !== this.$store.state.env.adminName) {
          r.checked = this.all
        }
      })
    },
    processMessage(message) {
      if (message.data.action === 'onlineUsers') {
        this.dataItems.forEach(
          (r) =>
            (r.online =
              message.data.users.length > 0 &&
              message.data.users.includes(r.id))
        )
      }
    },
    async load() {
      try {
        this.wait = true
        this.spinnerText = spinnerText

        const { data } = await this.$http.get('user/users')

        data.forEach((r) => {
          r.checked =
            r.name === this.$store.state.env.adminName ? false : this.all
          r.online = false
        })
        this.dataItems = data

        this.getOnlineUsers()
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
        const { data } = await this.$http.delete('user/users', {
          params: { ids },
        })
        this.$store.commit('notification', data)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async getOnlineUsers() {
      try {
        await this.$http.get('asHelper/users', {
          signal: abortController.signal,
        })
      } catch (error) {
        if (!abortController.signal.aborted) {
          this.$store.commit('error', error)
        }
      }
    },
  },
}
</script>

<style scoped>
.online {
  color: limegreen;
}
</style>
