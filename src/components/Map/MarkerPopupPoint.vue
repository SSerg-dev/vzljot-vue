<template>
  <div class="wrapper">
    <a @click="loadPoint(marker.id)" href="#">{{ marker.name }}</a>
    <div>
      Объект учета:
      <a @click="loadNode(marker.nodeid)" href="#">{{ marker.nodename }}</a>
    </div>
    <div v-if="marker.address">Адрес: {{ marker.address }}</div>
    <div
      v-if="marker.data !== null"
      style="overflow-y: auto; max-height: 145px"
    >
      <table
        v-for="(item, index) in marker.data"
        class="table-pattern"
        style="width: 100%"
        :key="index"
      >
        <tbody>
          <tr>
            <th colspan="2" style="white-space: nowrap">{{ item.title }}</th>
          </tr>

          <tr v-for="(value, index) in item.rows" :key="index">
            <td>{{ value.name }}</td>
            <td>
              <template v-if="value.value.indexOf('\r\n') !== -1">
                <div
                  v-for="(event, index) in value.value.split('\r\n')"
                  :key="index"
                >
                  {{ event }}
                </div>
              </template>
              <template v-else>
                {{ value.value }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>Состояние: {{ store.state.env.statuses[marker.state].text }}</div>
  </div>
</template>

<script>
export default {
  props: {
    marker: Object,
    store: Object,
  },
  methods: {
    loadNode(id) {
      window.open(`${window.props.baseUrl}Node/NodeDetailAlone/${id}`, '_blank')
    },
    loadPoint(id) {
      window.open(
        `${window.props.baseUrl}Point/PointDetailAlone/${id}`,
        '_blank'
      )
    },
  },
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
}

.wrapper .table-pattern th,
.wrapper .table-pattern td {
  border: 1px solid #c0c0c0;
  padding: 3px 3px 3px 3px;
}

.wrapper .table-pattern th {
  font-weight: normal;
}

.wrapper .table-pattern tr:hover {
  background-color: #eee;
}
</style>
