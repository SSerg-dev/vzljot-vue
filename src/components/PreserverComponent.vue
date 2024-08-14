<template>
  <div class="wrapper">
    <div class="component-detail">
      <slot></slot>
    </div>
    <div v-if="!readOnly" class="footer">
      <v-button
        caption="Сохранить"
        @click="onSaveClick"
        :disabled="saving || disabled"
      />
    </div>
  </div>
</template>

<script>
import VButton from './Inputs/VButton.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    VButton,
  },
  props: {
    saving: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      delay: 3000,
    }
  },
  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
  },
  methods: {
    onSaveClick() {
      if (!this.readOnly) {
        this.$emit('saveClick')
      }
    },
  },
}
</script>

<style scoped>
.wrapper {
  display: grid;
  flex: 1;
  overflow: auto;
  grid-template-rows: 1fr min-content;
  gap: 2px;
}

.footer {
  padding: 5px;
  width: 100%;
  background-color: #f6f8fb;
  display: flex;
  justify-content: flex-end;
}
</style>
