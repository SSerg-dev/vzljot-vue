<template>
  <div
    class="user-rights-grid"
    style="grid-template-columns: repeat(4, max-content)"
  >
    <div class="header">Наименование</div>
    <div class="header">Разрешить</div>
    <div class="header">Запретить</div>
    <div class="header">Итог</div>
    <template
      v-for="[k, v] in Object.entries($store.state.env.userRightGroupEnum)"
      :key="k"
    >
      <div class="group">{{ v }}</div>
      <template
        v-for="[key, value] in Object.entries(rights).filter(
          ([x, y]) => y.group === k
        )"
        :key="`${k}_${key}`"
      >
        <div class="right">
          {{ value.description }}
        </div>
        <input
          :disabled="disabled"
          v-model="value.allow"
          @change="onChangeAllow(key, value.allow)"
          class="checkbox"
          type="checkbox"
        />
        <input
          :disabled="disabled"
          v-model="value.deny"
          @change="onChangeDeny(key, value.deny)"
          class="checkbox"
          type="checkbox"
        />
        <div class="caption">{{ getCaption(key, value) }}</div>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    userRights: {
      type: Object,
      default: () => ({}),
    },
    groupsRights: {
      type: Object,
      default: () => ({}),
    },
    objectsRights: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rights: JSON.parse(JSON.stringify(this.userRights)),
    }
  },
  watch: {
    userRights: {
      handler(value) {
        this.rights = JSON.parse(JSON.stringify(value))
      },
      deep: true,
    },
  },
  methods: {
    onChangeAllow(key, value) {
      this.$emit('changeAllow', key, value)
    },
    onChangeDeny(key, value) {
      this.$emit('changeDeny', key, value)
    },
    getCaption(key, value) {
      const groupAccess = Object.prototype.hasOwnProperty.call(
        this.groupsRights,
        key
      )
        ? this.groupsRights[key]
        : null
      const objectAccess = Object.prototype.hasOwnProperty.call(
        this.objectsRights,
        key
      )
        ? this.objectsRights[key]
        : null

      if (value.deny === true) {
        return 'Запрещено'
      } else if (groupAccess === false) {
        return 'Запрещено группой'
      } else if (objectAccess === false) {
        return 'Запрещено доступом к объектам'
      } else if (value.allow === true) {
        return 'Разрешено'
      } else if (groupAccess === true) {
        return 'Pазрешено группой'
      } else {
        return null
      }
    },
  },
}
</script>

<style scoped>
.user-rights-grid {
  display: grid;
  gap: 5px 3px;
  align-items: center;
}

.group {
  background-color: #ecf0f6;
  grid-column: span 4;
  padding: 5px;
  color: #0070c4;
}

.header {
  position: sticky;
  top: 0;
  background-color: lightslategrey;
  color: white;
  padding: 5px;
}

.checkbox {
  align-self: center;
  justify-self: center;
  cursor: pointer;
}

.right {
  padding: 0 15px;
}

.caption {
  padding: 0 15px;
  justify-self: center;
}
</style>
