<template>
  <div class="wrapper">
    <div class="input" :class="{ error: error !== null }" :title="error">
      <div class="values" :style="`grid-template-columns: repeat(${localItems.filter(r => r.checked).length}, max-content)`">
        <span v-for="r in localItems.filter(r => r.checked)" :key="r[id]" class="value">{{ r[name] }}</span>
      </div>
      <div v-if="editable" class="fas fa-angle-down icon button" :class="{ clicked: show }" @click="onButtonClick()" />
    </div>
    <transition>
      <div v-show="show" class="items">
        <div v-for="r in localItems" :key="r[id]" class="item">
          <input type="checkbox" v-model="r.checked" @change="onChange" />
          <div>{{ r[name] }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    values: {
      type: Array,
      default: () => []
    },
    error: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: 'id'
    },
    name: {
      type: String,
      default: 'name'
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      show: false,
      localItems: JSON.parse(JSON.stringify(this.items))
        .map(r => Object.assign(r, { checked: this.values.includes(r[this.id]) }))
        .sort(this.sort)
    }
  },
  created() {
    this.$watch(
      () => this.values,
      values => {
        this.localItems = JSON.parse(JSON.stringify(this.items))
        .map(r => Object.assign(r, { checked: values.includes(r[this.id]) }))
        .sort(this.sort)
      }
    )
  },
  mounted() {
    document.addEventListener('click', this.click)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.click)
  },
  methods: {
    sort(a, b) {
      if (a[this.name].toLowerCase() < b[this.name].toLowerCase()) return -1
      if (a[this.name].toLowerCase() > b[this.name].toLowerCase()) return 1
    },
    click(e) {
      if (this.show) {
        this.show = this.$el.contains(e.target)
      }
    },
    onButtonClick() {
      this.show = !this.show
    },
    onChange() {
      this.$emit(
        'changed',
        this.localItems.filter(r => r.checked).map(r => r[this.id])
      )
    }
  }
}
</script>

<style scoped>
.wrapper {
  position: relative;
  user-select: none;
}

.input {
  display: grid;
  grid-template-columns: 1fr min-content;
  row-gap: 3px;
  padding: 2px 4px;
  border: thin solid darkgray;
  border-radius: 3px;
  min-height: 28px;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  transition: all 0.2s linear;
}

.button:hover {
  color: darkslategray;
}

.button.clicked {
  transform: rotate(180deg);
}

.error {
  border-color: #b22222;
  background-color: #fde;
}

.items {
  position: absolute;
  top: 100%;
  left: 0;
  white-space: nowrap;
  color: inherit;
  background-color: #fff;
  z-index: 100;
  right: 0;
  box-shadow: 3px 3px 10px rgb(32 33 36 / 28%);
  max-height: 200px;
  overflow: auto;
}

.item {
  display: grid;
  column-gap: 5px;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding: 3px 3px;
  outline: 0 none;
  cursor: pointer;
  color: inherit;
}

.item input[type='checkbox'] {
  cursor: pointer;
}

.item:hover {
  background-color: #f8f9f9;
}

.values {
  display: grid;
  gap: 5px;
}

.value {
  background-color: #ecf0f6;
  padding: 3px 5px;
  border-radius: 1em;
}
</style>
