<template>
  <div class="fit">
    <expantion caption="Основные параметры" :resizable="false">
      <div class="grid two">
        <label>Наименование:</label>
        <input v-model.trim="localName" @input="onChange('localName', localName)" type="text" maxlength="50" :class="{ 'validation-error': error.name }" :title="error.name" style="width: 200px;" />
        <label>Приоритет:</label>
        <select v-model="localPriority" @change="onChange('localPriority', localPriority)">
          <option v-for="[k, v] in Object.entries($store.state.env.notificationPriorityEnum)" :key="k" :value="k">{{ v }}</option>
        </select>
      </div>
    </expantion>
  </div>
</template>

<script>
  import Expantion from '../ExpantionPanel.vue'

  export default {
    components: {
      Expantion
    },
    props: {
      id: Number,
      name: String,
      priority: String,
      subscriptions: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        localName: this.name,
        localPriority: this.priority,
        error: {
          name: null
        }
      }
    },
    watch: {
      name(value) {
        this.localName = value
      },
      priority(value) {
        this.localPriority = value
      }
    },
    methods: {
      onChange(prop, value) {
        this.$emit('changed', prop, value)
      },
      validateData() {
        Object.keys(this.error).forEach(r => this.error[r] = null)

        if (this.localName === null || this.localName === '') {
          this.error.name = 'Наименование не может быть пустым.'
        }

        if (this.subscriptions.find(r => r.name === this.localName && (r.id !== this.id))) {
          this.error.name = 'Наименование должно быть уникальным.'
        }
        return Object.keys(this.error).reduce((sum, current) => sum && !this.error[current], true)
      },
      save() {
        if (this.validateData()) {
          let result = {
            name: this.localName,
            priority: this.localPriority
          }
          this.$emit('changed', result)
          return result         
        }
        return false
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