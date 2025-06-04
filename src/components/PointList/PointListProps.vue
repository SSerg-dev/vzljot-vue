<template>
  <div class="fit">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="grid two">
        <label>Наименование:</label>
        <input v-model.trim="localName" type="text" maxlength="80" @input="onChange" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      </div>
    </expantion-panel>
  </div>
</template>

<script>
  import { PointList } from '../../classes/pointList'

  import ExpantionPanel from '../ExpantionPanel.vue'
  
  export default {
    components: {
      ExpantionPanel
    },
    props: {
      name: {
        type: String,
        default: null
      },
      error: {
        type: Object,
        default: () => ({
          name: null
        })
      }
    },
    data() {
      return {
        localName: this.name,
        localError: JSON.parse(JSON.stringify(this.error))
      }
    },
    watch: {
      name(name) {
        this.localName = name
      },
      error: {
        handler(error) {
          this.localError = JSON.parse(JSON.stringify(error))
        },
        deep: true
      }
    },
    methods: {
      onChange() {
        this.$emit('change', 'name', this.localName)
      },
      async save() {
        try {
          Object.keys(this.localError).forEach(r => this.localError[r] = null)

          const task = new PointList({ name: this.localName })
          await task.save()

          return true
          
        } catch (error) {
          if (error.response?.status !== 552) {
            if (error.response?.status === 551) {
              this.localError = error.response.data
            } else {
              this.$store.commit('error', error)
            }
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
</style>
