<template>
  <div
    class="tree-wrapper"
    tabIndex="0"
    @keydown.up.prevent="up(selectedNode)"
    @keydown.down.prevent="down(selectedNode)"
    @keydown.enter.prevent="enter(selectedNode)"
    @keyup.left="left(selectedNode)"
    @keyup.right="right(selectedNode)"
    @click="onClick"
    @mouseover="mouseover($event)"
    @mouseout="mouseout($event)"
  >
    <div
      v-if="hoveredNode"
      class="button-panel"
      :style="
        hoverRect
          ? { top: `${hoverRect.top - offsetTop + $el.scrollTop}px` }
          : null
      "
    >
      <fab-button
        v-if="hoveredNode && hoveredNode.canAdd()"
        @click="$emit('create', hoveredNode)"
        :fabStyle="fabStyle"
        class="fas fa-plus"
        title="Добавить..."
        :style="styleColors"
      >
      </fab-button>
      <fab-button
        v-if="hoveredNode && hoveredNode.canDelete()"
        @click="$emit('delete', hoveredNode)"
        :fabStyle="fabStyle"
        class="fas fa-times"
        title="Удалить..."
        :style="styleColors"
      >
      </fab-button>
    </div>
  </div>
</template>

<script>
import { Node, createHtml } from '../../plugins/node.js'
import { matchType } from '../../plugins/api.js'

import FabButton from '../FabButton.vue'

// import { safeStringify } from '@/utils/common.functions.js'

function isFolder(node) {
  return (node.children && node.children.length) || node.isFolder
}

export default {
  components: { FabButton },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    const itemTypes = matchType(this.$store.state.env.itemTypes)
    return {
      list: {},
      items: [],
      selectedNode: null,
      hoveredNode: null,
      hoveredElement: null,
      fabStyle: {
        width: '22px',
        height: '22px',
        borderRadius: '2px',
        marginRight: '3px',
      },
      itemTypes: [
        'address',
        'balanceGroup',
        'groupConnection',
        'equip',
        'equipList',
        'node',
        'point',
        'pointGroup',
        'pointList',
        'set',
        'symbolSchema',
        'systemNode',
      ],
      nodeTypes: this.data.nodeTypes.map((r) => itemTypes[r]),
      components: [],
      permitsMap: new Map(),
      localNode: null,
    }
  },
  computed: {
    offsetTop() {
      return this.$el.getBoundingClientRect().top
    },
    hoverRect() {
      return this.hoveredNode
        ? this.hoveredNode.domBody().getBoundingClientRect()
        : null
    },
    styleColors() {
      return this.$store.getters.styleColors
    },
  },
  created() {
    this.$emitter.on('updateObject', this.update)
    this.$emitter.on('deleteObject', this.delete)
    this.$emitter.on('afterNodeChange', this.onAfterNodeChange)
    this.$emitter.on('tree-layout:create', this.handleCreate)
  },
  mounted() {
    this.$nextTick().then(() => this.init())
  },
  beforeUnmount() {
    this.$emitter.off('updateObject', this.update)
    this.$emitter.off('deleteObject', this.delete)
    this.$emitter.off('afterNodeChange', this.onAfterNodeChange)
  },
  methods: {
    getList(nodes) {
      for (let node of nodes) {
        this.list[node.getId()] = node
        this.getList(node.children)
      }
    },
    removeNodes(nodes) {
      for (let node of nodes) {
        delete this.list[node.getId()]
        this.removeNodes(node.children)
      }
    },
    async init() {
      try {
        let { data } = await this.$http.get(this.data.urls.init)
        this.build(data)
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    build(data) {
      this.items = data.map((item) => new Node(item, null, this.$el))
      this.getList(this.items)
      let arr = []
      createHtml(this.items, arr)
      this.$el.insertAdjacentHTML('beforeend', arr.join(''))
      if (this.items.length > 0) {
        this.select(this.items[0])
      }
    },
    up(node) {
      if (node) {
        if (node.parent) {
          let index = node.parent.children.indexOf(node) - 1

          if (index >= 0) {
            this.previous(node.parent.children[index])
          } else {
            this.select(node.parent)
          }
        } else {
          let index = this.items.indexOf(node) - 1
          if (index >= 0 && index < this.items.length) {
            this.previous(this.items[index])
          }
        }
      }
    },
    previous(node) {
      if (node && node.children && isFolder(node) && node.expanded) {
        this.previous(node.children[node.children.length - 1])
      } else {
        this.select(node)
      }
    },
    next(node) {
      if (node) {
        if (node.parent) {
          let index = node.parent.children.indexOf(node) + 1
          if (index >= node.parent.children.length) {
            this.next(node.parent)
          } else {
            this.select(node.parent.children[index])
          }
        } else {
          let index = this.items.indexOf(node) + 1
          if (index >= 0 && index < this.items.length) {
            this.select(this.items[index])
          }
        }
      }
    },
    down(node) {
      if (node) {
        if (isFolder(node) && node.expanded) {
          this.select(node.children[0])
        } else {
          this.next(node)
        }
      }
    },
    left(node) {
      if (node && isFolder(node) && node.childrenLoaded && node.expanded) {
        node.toggle(false)
      }
    },
    right(node) {
      if (node && isFolder(node)) {
        if (!node.childrenLoaded) {
          this.load(node, this.data.urls.load)
        } else {
          node.toggle(true)
        }
      }
    },
    async enter(node) {
      let deniedNodes = [
        'points',
        'equips',
        'equipLists',
        'pointLists',
        'balanceGroups',
        'reportTasks',
        'pointGroups',
      ].map((r) => this.$store.getters.reversedItemTypes[r])
      if (node && isFolder(node) && !deniedNodes.includes(node.type)) {
        if (node.expanded) {
          this.removeNodes(node.children)
          node.clear()
        } else {
          this.load(node, this.data.urls.loadAll)
        }
      }
    },
    hasVegaEquip(children) {
      const regex = /Vega/
      return children
        .map((child) => ({
          child,
          code: child.code,
        }))
        .some((node) => regex.test(node.code))
    },

    permits(id, isPermit) {
      this.permitsMap.set(id, { id, isPermit })
      return [...this.permitsMap.values()]
    },

    async load(node, url) {
      let toggle = node.domToggle()
      try {
        toggle.classList.add('loading')
        let { data } = await this.$http.get(url, { params: node })

        const isPermit = this.hasVegaEquip(data)

        if (typeof node.id === 'number' && typeof isPermit === 'boolean') {
          this.$store.state.equip.hasVegaEquipArray = this.permits(
            node.id,
            isPermit
          )
        }

        let children = data.map((child) => new Node(child, node, node.$el))
        this.getList(children)
        node.expanded = true
        node.createChildren(children)

        toggle.classList.add('opened')
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        toggle.classList.remove('loading')
      }
    },
    onSi(message) {
      if (message && this.nodeTypes.includes(message.type)) {
        // console.log('message', message.event, this.$store.state.env.itemTypes[message.type].type, message.item)
        let node = this.list[`${message.type}_${message.item.id}`]
        if (message.event === 'delete') {
          if (node && node.parent) {
            if (node.selected) this.up(node)
            this.removeNodes([node])
            node.delete()
          }
        }
        if (message.event === 'update' && node) {
          node.updateState(message.item.state)
        }
        if (message.event === 'add') {
          if (!node) {
            let parentNode =
              this.list[`${message.item.parent.type}_${message.item.parent.id}`]
            if (parentNode) {
              parentNode.setFolder(true)
              if (parentNode.childrenLoaded) {
                let asd = new Node(message.item, parentNode, this.$el)
                this.getList([asd])
                parentNode.createChild(asd)
              }
            }
          }
        }
      }
    },
    update(node) {
      if (this.nodeTypes.includes(node.type)) {
        let item = this.list[`${node.type}_${node.id}`]

        if (item) {
          // console.log('node', node, item)
          // debugger
          item.update(node)
          if (
            item.parent.type !== node.parent.type ||
            item.parent.id !== node.parent.id
          ) {
            this.removeNodes([item])
            item.delete()
            let parentNode = this.list[`${node.parent.type}_${node.parent.id}`]
            if (parentNode) {
              parentNode.setFolder(true)
            }
            if (parentNode && parentNode.childrenLoaded) {
              this.getList([item])
              parentNode.createChild(item)
              item.parent = parentNode
            }
          }
        } else if (node.parent) {
          let parentNode = this.list[`${node.parent.type}_${node.parent.id}`]
          if (parentNode) {
            // console.log('1', node.parent, parentNode)
            parentNode.setFolder(true)
            if (parentNode.childrenLoaded) {
              let asd = new Node(node, parentNode, this.$el)
              this.getList([asd])
              parentNode.createChild(asd)
            }
          }
        }
      }
    },
    delete(message) {
      let node = this.list[`${message.type}_${message.id}`]
      if (node && node.parent) {
        if (node.selected) this.up(node)
        this.removeNodes([node])
        node.delete()
      } else {
        if (message.parent) {
          node = this.list[`${message.parent.type}_${message.parent.id}`]
          if (node && !isFolder(node)) node.setFolder(false)
        }
      }
    },
    onAfterNodeChange({ node, target }) {
      if (this.nodeTypes.includes(node.type) && target) {
        node.$el = target.parentNode
        this.select(node)
        this.$el.focus() // for ie
      }
    },
    onComponentCreated({ id, type, key, component }) {
      if (this.itemTypes.includes(this.$store.state.env.itemTypes[type].type)) {
        this.components.push({ id, type, key, component })
      }
    },
    async handleCreate() {},

    onClick(event) {
      let target = event.target
      while (target) {
        if (target.classList) {
          if (target.classList.contains('body') && target.parentNode) {
            const node = this.list[target.parentNode.getAttribute('id')]

            if (this.selectedNode !== node) {
              if (
                this.itemTypes.includes(
                  this.$store.state.env.itemTypes[this.selectedNode.type].type
                ) &&
                this.nodeTypes.includes(this.selectedNode.type)
              ) {
                this.$emitter.emit('beforeNodeChange', {
                  uuid: this.selectedNode.uuid,
                  node,
                  target,
                })
              } else {
                node.$el = target.parentNode
                this.select(node)
                this.$el.focus() // for ie
              }
            }

            return false
          }
          if (target.classList.contains('toggle') && target.parentNode) {
            const node = this.list[target.parentNode.getAttribute('id')]

            if (node) {
              if (isFolder(node)) {
                if (node.childrenLoaded) {
                  node.toggle(!target.classList.contains('opened'))
                } else {
                  this.load(node, this.data.urls.load)
                }
              }
            }
            return false
          }
        }
        target = target.parentNode
      }
    },
    mouseover(event) {
      let classList = event.target.classList
      if (classList) {
        for (let i = 0; i < classList.length; i++) {
          if (classList[i] === 'node') {
            this.hoveredElement = event.target
            break
          }
          if (
            classList[i].indexOf('equip') +
              classList[i].indexOf('point') +
              classList[i].indexOf('status') >
            -1
          ) {
            this.hoveredElement = event.target.parentNode.parentNode
            break
          }
          if (classList[i] === 'body' || classList[i] === 'toggle') {
            this.hoveredElement = event.target.parentNode
            break
          }
        }
        if (
          this.hoveredElement &&
          this.hoveredNode !== this.list[this.hoveredElement.getAttribute('id')]
        ) {
          this.hoveredNode = this.list[this.hoveredElement.getAttribute('id')]
        }
      }
    },
    mouseout(event) {
      let target = event.target
      let relatedTarget = event.relatedTarget
      if (!this.hoveredElement) return

      if (relatedTarget !== this.$el) {
        if (relatedTarget) {
          while (relatedTarget && relatedTarget !== this.$el) {
            if (
              relatedTarget === this.hoveredElement ||
              relatedTarget.className === 'button-panel'
            )
              return
            relatedTarget = relatedTarget.parentNode
          }
        }

        if (relatedTarget === this.$el) {
          if (target) {
            while (target) {
              if (
                target === this.hoveredElement ||
                target.className === 'button-panel'
              )
                return
              target = target.parentNode
            }
          }
        }
      }

      this.hoveredElement = null
      this.hoveredNode = null
    },
    select(node) {
      this.components = []

      if (this.selectedNode) {
        this.selectedNode.select(false)
      }
      if (node) {
        node.select(true)
        this.selectedNode = node
        this.$emit('nodeSelect', node)

        this.$emitter.emit('tree-component:change-node', this.selectedNode.id)
        const options = {
          selectedNodeId: this.selectedNode.id,
        }
        this.$store.commit('setCard', options)

        this.scroll(node)
      }
    },
    scroll(node) {
      let current = node.domBody().getBoundingClientRect()
      let wrapper = this.$el.getBoundingClientRect()

      if (wrapper.top > current.top) {
        this.$el.scrollTop = this.$el.scrollTop - (wrapper.top - current.top)
      }
      if (current.bottom > wrapper.bottom) {
        this.$el.scrollTop =
          this.$el.scrollTop + (current.bottom - wrapper.bottom)
      }
    },
    search(item) {
      let parents = []
      this.$http
        .get(this.data.urls.search, { params: item })
        .then(async ({ data: parent }) => {
          while (parent.parent) {
            parents.push(parent.parent)
            parent = parent.parent
          }
          parents = parents.reverse()

          for (const parent of parents) {
            let node = this.list[`${parent.type}_${parent.id}`]
            if (!node) {
              const lastParent = parents[parents.length - 1]
              if (lastParent) {
                node = this.list[`${lastParent.type}_${lastParent.id}`]
              }
            }
            if (node) {
              if (!node.childrenLoaded) {
                await this.load(node, this.data.urls.load)
              } else {
                node.toggle(true)
              }
            }
          }
          this.$nextTick().then(() =>
            this.select(this.list[`${item.type}_${item.id}`])
          )
        })
        .catch((error) => this.$store.commit('error', error))
    },
  },
}
</script>

<style>
.tree-wrapper {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1 1 auto;
  outline: 0;
}

.tree-wrapper .button-panel {
  position: absolute;
  right: 10px;
  transition: all 0.1s linear;
}

.node {
  padding: 0 0 0 1em;
  white-space: nowrap;
  outline: 0;
}

.node .toggle {
  cursor: pointer;
  color: #777;
  transition: transform 0.3s ease;
  font-size: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
}

.node .toggle::before {
  content: '\f054';
}

.node .toggle:hover {
  color: #0070c4;
}

.node .toggle.opened {
  transform: rotate(90deg);
}

.node .toggle.loading:before {
  font-size: 12px;
  content: '\f3f4';
  animation: opacity 0.15s ease-in-out, toggle-spin 1s ease-in-out infinite;
}

.node .body {
  display: inline-flex;
  align-items: center;
  margin: 1px 0;
  padding: 3px;
  text-decoration: none;
  outline: 0 none;
  cursor: pointer;
  background-repeat: no-repeat;
}

.node .body.nofolder {
  margin-left: 16px;
}

.node .body:hover,
.node .body.selected {
  background-color: #eee;
}

.tree-wrapper:focus .node .body.selected {
  background-color: #0070c4;
  color: #fff;
  outline: #777 dotted 1px;
}

.node .body > div {
  margin: 0 5px 0 0;
}

.node,
.node .toggle,
.node .body {
  user-select: none;
}

.tree-wrapper:focus .node .body.selected .icon {
  color: #fff;
}

@keyframes opacity {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes toggle-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.node.hidden {
  display: none;
}
</style>
