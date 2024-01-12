<template>
  <div class="component-detail">
    <tool-bar>
      <div :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]" title="Добавить..." @click="onAddClick()" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected || wait }]" title="Удалить" @click="onRemoveClick()" />
    </tool-bar>
    <div class="table-grid" style="grid-template-columns: repeat(4, max-content)">
      <header class="header"></header>
      <header class="header"><input type="checkbox" v-model="all" @change="changeAll" :disabled="wait" /></header>
      <header class="header">Наименование</header>
      <header class="header">Системная</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div class="fas fa-users clickable-icon" title="Просмотр..." @click="viewClick(r)" />
        </span>
        <span class="cell">
          <input v-if="r.code === 'unknown'" type="checkbox" v-model="r.checked" :disabled="wait" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.code === 'unknown' ? 'Нет' : 'Да' }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="spinnerText" />
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" :key="0" />
      <props-component v-if="edit" v-bind="component" @close="close" :key="1">
        <user-group-component v-bind="component.data" @saved="onSaved"/>
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import {UserGroup} from '../../classes/userGroup'

const spinnerText = 'Загрузка данных...'

let wizardAdd = value => {
  return {
    name: 'add',
    component: {
      text: 'Создание группы:',
      component: 'user-group-props',
      event: 'change',
      data: value
    }
  }
}

let wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление групп:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные группы?'
      }
    }
  }
}

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'
import PropsComponent from '../PropsComponent.vue'
import UserGroupComponent from './UserGroup.vue'

export default {
  name: 'userGroups',
  components: {
    PagerComponent,
    ToolBar,
    Wizard,
    PropsComponent,
    UserGroupComponent
  },
  extends: ListComponent,
  data() {
    return {
      wait: false,
      spinnerText: spinnerText,
      wizard: null,
      component: {},
      componentData: null,
      edit: false,
    }
  },
  async mounted() {
    await this.load()
  },
  methods: {
    onUpdate(item) {
      if (this.$store.state.env.itemTypes[item.type].type === 'userGroup') {
        let userGroup = this.dataItems.find(r => r.id === item.id)
        if (userGroup) {
          userGroup.name = item.name
        } else {
          this.dataItems.push({
            id: item.id,
            type: item.type,
            name: item.name,
            code: item.code,
            checked: false
          })
        }
      }
    },
    onDelete(obj) {
      if (this.$store.state.env.itemTypes[obj.type].type === 'userGroup') {
        const index = this.dataItems.findIndex(r => r.id === obj.id)
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'remove') {
        this.remove(this.dataItems.filter(r => r.checked === true).map(r => r.id))
      } else if (name === 'edit') {
        let user = this.dataItems.find(r => r.id === data.id)
        if (user) {
          Object.entries(data).forEach(([key, value]) => {
            if (user.hasOwnProperty(key)) {
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
        group: new UserGroup({}),
        error: this.error
      })
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    viewClick(r) {
      const userGroup = new UserGroup(r)

      this.component = {
        image: userGroup.image,
        text: `Группа: ${userGroup.name}`,
        uuid: userGroup.uuid,
        data: {
          code: userGroup.code,
          id: userGroup.id,
          uuid: userGroup.uuid          
        }
      }

      this.edit = true
    },
    onSaved(data) {
      this.component.text = `Группа: ${data.name}`
    },
    changeAll() {
      this.dataItems.forEach(r => {
        if (r.code === 'unknown') {
          r.checked = this.all
        }
      })
    },
    async load() {
      try {
        this.wait = true
        this.spinnerText = spinnerText

        const { data } = await this.$http.get('userGroup/groups')

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
        await this.$http.delete('userGroup/groups', { params: { ids } })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    }
  }
}
</script>
