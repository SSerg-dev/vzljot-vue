<template>
  <modal
    @cancel="onCancel()"
    :background="background"
    :cancellable="isCancellable"
  >
    <template v-slot:header>
      <span>{{ currentComponent.text }}</span>
    </template>
    <template v-slot:content>
      <div style="position: relative">
        <div class="component-detail" style="overflow: visible">
          <component
            ref="component"
            :key="currentComponent.key"
            :is="currentComponent.component"
            v-bind="currentComponent.data"
          />
        </div> 
      </div>
    </template>
    <template v-slot:footer>
      <button :disabled="nextDisabled" @click="handleOkClick">
        {{ hasNext ? 'Далее' : 'Ok' }}
      </button>
      <button
        v-if="
          isCancellable && !this.$store.state.equip.equipEvent.hasExistDateSet
        "
        @click="onCancel()"
      >
        Отмена
      </button>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal.vue'
import Message from '@/components/Message.vue'

export default {
  name: 'wizard-message',
  components: {
    Modal,
    Message,
  },
  props: {
    name: {
      type: String,
      default: null,
    },
    component: {
      type: Object,
      default: () => ({
        event: null,
      }),
    },
    background: {
      type: String,
      default: 'rgba(169, 175, 183, 0.7)',
    },
    cancellable: {
      type: Boolean,
      default: true,
    },
    wait: Boolean,
    waitText: String,
  },
  data() {
    return {
      currentComponent: this.initComponent(this.component),
      currentValue: null,
      loading: false,
    }
  },
  emits: ['cancel', 'end', 'change'],
  watch: {
    component: {
      handler(value) {
        this.currentComponent = this.initComponent(value)
      },
      deep: true,
    },
  },
  computed: {
    hasNext() {
      return typeof this.currentComponent.next === 'function'
    },
    nextDisabled() {
      if (
        Object.prototype.hasOwnProperty.call(this.currentComponent, 'isLast')
      ) {
        return !this.currentComponent.isLast
      }

      if (this.currentComponent.event === null) {
        return false
      }
      return (
        this.currentValue === null ||
        (Array.isArray(this.currentValue) && this.currentValue.length === 0
          ? true
          : false)
      )
    },
    isCancellable() {
      return this.cancellable && this.currentComponent.cancellable
    },
  },
  methods: {
    handleOkClick() {
      this.next()
    },
    initComponent(value) {
      return Object.assign(
        { cancellable: true, event: null, key: new Date().getTime() },
        value
      )
    },

    onCancel() {
      this.currentValue = null
      this.$emit('cancel', this.name)
    },
    async next() {
      if (typeof this.$refs.component.save === 'function') {
        if (!(await this.$refs.component.save())) {
          return
        }
      }
      if (this.hasNext) {
        try {
          this.loading = true
          this.currentComponent = this.initComponent(
            await this.currentComponent.next(this.currentValue)
          )
        } catch (error) {
          this.$store.commit('error', error)
        } finally {
          this.loading = false
        }
      } else {
        this.$emit(
          'end',
          this.currentValue,
          this.name,
          this.currentComponent.component
        )
      }

      this.currentValue = null
    },
  }, // end methods
}
</script>
