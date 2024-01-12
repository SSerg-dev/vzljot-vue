<template>
  <div class="toolbar-wrapper">
    <div class="toolbar main" :style="`grid-template-columns: repeat(${mainCount}, max-content);`">
      <slot />
    </div>
    <div class="toolbar end" :style="`grid-template-columns: repeat(${endCount}, max-content);`">
      <slot name="end" />
      <div v-if="!isEmpty(localExportTypes)" class="button dropdown fas fa-file-download" title="Экспорт">
        <div class="exportMenu" title="">
          <div :style="exportItemStyle" class="item" v-for="key in Object.keys(localExportTypes)" :key="key" @click="$emit('export', key)">
            {{ localExportTypes[key] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    exportTypes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // exportMenuStyle: {
      //   display: 'none',
      //   position: 'absolute',
      //   backgroundColor: 'white',
      //   border: '1px solid #666',
      //   zIndex: '101',
      //   top: '100%',
      //   right: '0',
      //   fontSize: '16px'
      // },
      exportItemStyle: {
        color: '#666',
        padding: '4px 10px',
        cursor: 'pointer',
        textAlign: 'left'
      },
      mainCount: 0,
      endCount: 0
    }
  },
  computed: {
    localExportTypes() {
      let object = {}
      if (this.exportTypes && this.exportTypes.length > 0) {
        Object.entries(this.$store.state.env.exportTypes).forEach(([, value]) => {
          if (this.exportTypes.includes(value.type)) object[value.type] = value.text
        })
      }
      return object
    }
  },
  async mounted() {
    await this.$nextTick()

    this.mainCount = this.$el.querySelector('.toolbar.main').children.length
    this.endCount = this.$el.querySelector('.toolbar.end').children.length
  },
  methods: {
    isEmpty(object) {
      for (var key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) return false
      }
      return true
    }
  }
}
</script>

<style>
.toolbar-wrapper {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 5px;
  padding: 5px;
  color: darkslategray;
  background-color: #ecf0f6;
}

.toolbar-wrapper .toolbar {
  display: grid;
  gap: 5px;
  grid-template-rows: max-content;
}

.toolbar-wrapper .button {
  color: lightslategray;
  cursor: pointer;
  display: flex;
  font-size: 21px;
  min-width: 21px;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: 0.2s;
}

.toolbar-wrapper .toolbar .remove-sign:after {
  font-size: 10px;
  position: absolute;
  right: 0;
  bottom: 0;
  content: '\f00d';
}

.toolbar-wrapper .toolbar .separator {
  border-left: thin solid #ccc;
}

.toolbar-wrapper .toolbar .button.disabled,
.toolbar-wrapper .toolbar .button.disabled:before,
.toolbar-wrapper .toolbar .button.disabled:after {
  opacity: 0.5;
  pointer-events: none;
}

.toolbar-wrapper .toolbar .button:not(.disabled):hover {
  color: #48525c;
}

.toolbar-wrapper .toolbar .button.dropdown:not(.disabled):hover .exportMenu {
  display: inline;
}

.toolbar-wrapper .toolbar .exportMenu {
  display: none;
  position: absolute;
  background-color: white;
  border: 1px solid lightslategray;
  z-index: 101;
  top: 100%;
  right: 0;
  font-size: medium;
}

.toolbar-wrapper .toolbar .exportMenu .item:hover {
  background-color: #ecf0f6;
}
</style>
