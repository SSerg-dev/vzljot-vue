<template>
  <div class="fit">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="grid two">
        <label>Наименование:</label>
        <input v-model.trim="name" @input="onChangeName()" type="text" maxlength="50" :class="{ 'validation-error': localError.name }" :title="localError.name" style="min-width: 200px;" />
      </div>
    </expantion-panel>
  </div>
</template>

<script>
import {UserGroup} from '../../classes/userGroup'

import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    ExpantionPanel
  },
  props: {
    group: Object,
    error: {
      type: Object,
      default: () => ({
        name: null
      })
    }
  },
  data() {
    return {
      name: this.group.name,
      localError: JSON.parse(JSON.stringify(this.error))
    }
  },
  watch: {
    error: {
      handler(value) {
        this.localError = JSON.parse(JSON.stringify(value))
      },
      deep: true
    },
    'group.name'(r) {
      this.name = r
    }
  },
  methods: {
    onChangeName() {
      this.$emit('change', 'name', this.name)
    },
    async save(rights) {
      try {
        this.localError = {}

        await new UserGroup({ name: this.name }).save(rights)

        return true
        
      } catch (error) {
        if (error.response.status === 551) {
          this.localError = error.response.data
        } else {
          this.$store.commit('error', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
  align-items: center;
}

.grid.two {
  grid-template-columns: max-content max-content;
}

.grid label {
  text-align: right;
}

.name {
  padding: 2px 4px;
  border: thin solid darkgray;
  border-radius: 3px;
  height: 100%;
  width: 200px;
}
</style>
