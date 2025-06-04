<template>
  <li>
    <div :class="nodeClass" :disabled="disabled">
      <span v-if="node.children && node.children.length" :class="{ fas: true, toggle: true, 'fa-angle-right': true, opened: node.isOpen }" @click="onExpand(node)" />
      <input type="checkbox" v-model="checked" v-indeterminate="node.indeterminate" :disabled="disabled" @change="onChange" />
      {{ node.name }}
    </div>
    <transition-expand>
      <ul class="recursive-node" v-if="node.isOpen && node.children && node.children.length">
        <recursive-node v-for="child in node.children" :node="child" :key="child.key" :disabled="disabled" @checkChange="onCheckChange" />
      </ul>
    </transition-expand>
  </li>
</template>

<script>
export default {
  directives: {
    indeterminate(el, binding) {
      el.indeterminate = Boolean(binding.value)
    }
  },
  props: {
    node: Object,
    disabled: Boolean
  },
  data() {
    return {
      checked: this.node.checked
    }
  },
  computed: {
    nodeClass() {
      let obj = {
        grid: true
      }

      if (this.node.children && this.node.children.length) {
        obj.three = true
      } else {
        obj.two = true
        obj.pad = true
      }

      return obj
    }
  },
  created() {
    this.$watch(
      () => this.node.checked,
      value => (this.checked = value)
    )
  },
  methods: {
    onExpand(node) {
      if (!this.disabled) {
        node.isOpen = !node.isOpen
        this.$emit('expand', node)
      }
    },
    onChange() {
      if (!this.disabled) {        
        this.$emit('checkChange', this.node, this.checked)
      }
    },
    onCheckChange(node, value) {
      if (!this.disabled) {
        this.$emit('checkChange', node, value)
      }
    }
  }
}
</script>
