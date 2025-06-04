<template>
  <div class="users-filter">
    <label>Наименование:</label>
    <input v-model="values.name" type="text" @input="onChange" maxlength="50"/>
    <label>Группа:</label>
    <select v-model="values.groups" @change="onChange">
      <option v-for="(r, index) in groups" :key="index" :value="r.id">{{ r.name }}</option>
    </select>
    <label>Заблокирован?:</label>
    <select v-model="values.enabled" @change="onChange">
      <option value="false">Да</option>
      <option value="true">Нет</option>
    </select>
    <label>Примечание:</label>
    <input v-model="values.desc" type="text" @input="onChange" maxlength="200"/>
  </div>
</template>

<script>
  export default {
    name: 'usersFilter',
    props: {
      filter: {
        type: Object,
        default: () => { }
      },
      groups: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        values: JSON.parse(JSON.stringify(this.filter))
      }
    },
    methods: {
      onChange() {
        this.$emit('changed', this.values)
      }
    }
  }

</script>

<style scoped>
  .users-filter {
    display: grid;
    grid-gap: 5px 3px;
    grid-template-columns: 1fr auto;
  }

  .users-filter label {
    text-align: right;
  }

  .users-filter select {
    width: fit-content;
  }
</style>