<template>
  <div class="pager">
    <div
      v-if="totalPages > 1"
      :class="[
        'link-fast',
        'fas',
        'fa-angle-double-left',
        { disabled: localPage == 1 },
      ]"
      @click="go(1)"
      title="В начало"
    ></div>
    <div
      v-if="totalPages > 1"
      :class="[
        'link-fast',
        'fas',
        'fa-angle-left',
        { disabled: localPage == 1 },
      ]"
      @click="go(localPage - 1)"
      title="Назад"
    ></div>
    <div
      v-for="(button, index) in buttons"
      :key="index"
      :class="['link', { selected: localPage == button }]"
      @click="go(button)"
    >
      {{ button }}
    </div>
    <div
      v-if="totalPages > 1"
      :class="[
        'link-fast',
        'fas',
        'fa-angle-right',
        { disabled: localPage == totalPages },
      ]"
      @click="go(localPage + 1)"
      title="Вперед"
    ></div>
    <div
      v-if="totalPages > 1"
      :class="[
        'link-fast',
        'fas',
        'fa-angle-double-right',
        { disabled: localPage == totalPages },
      ]"
      @click="go(totalPages)"
      title="В конец"
    ></div>
    <div class="comment">
      Строк на странице:
      <select v-model="localSize" @change="go(1, true)">
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="75">75</option>
        <option value="100">100</option>
      </select>
      Строк: {{ localItems }}; Страниц: {{ totalPages }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    Page: Number,
    Size: Number,
    Items: Number,
    buttonsCount: {
      type: Number,
      default: 8,
    },
  },
  data() {
    return {
      localItems: this.Items,
      localPage: this.Page,
      localSize: this.Size,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.localItems / this.localSize)
    },
    buttons() {
      var start = this.localPage - Math.ceil(this.buttonsCount / 2)
      var end = this.localPage + Math.floor(this.buttonsCount / 2)

      if (start <= 0) {
        end -= start
        start = 0
      }
      if (end > this.totalPages) {
        end = this.totalPages
        if (end > this.buttonsCount) {
          start = end - this.buttonsCount
        }
      }

      var arr = []
      if (this.totalPages > 1) {
        for (var i = start + 1; i <= end; i++) {
          arr.push(i)
        }
      }

      return arr
    },
  },
  watch: {
    Items(value) {
      this.localItems = value
    },
    Page(value) {
      this.localPage = value
    },
    Size(value) {
      this.localSize = value
    },
  },
  methods: {
    go(page, force) {
      if (page === this.localPage && force === undefined) {
        return
      }
      this.$emit('go', parseInt(page), parseInt(this.localSize))
    },
  },
}
</script>

<style>
.pager {
  margin: 0;
  padding: 2px;
  color: #666;
  background-color: #ecf0f6;
  display: inline-flex;
  user-select: none;
}

.pager .comment {
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.pager .comment > * {
  margin: 0 2px;
}

.pager .link,
.pager .link-fast {
  margin-left: 1px;
  width: 3em;
  padding: 2px;
  transition: all 0.1s;
  cursor: pointer;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pager .link-fast.disabled {
  color: rgba(102, 102, 102, 0.4);
  pointer-events: none;
  cursor: default;
}

.pager .selected,
.pager .link:hover,
.pager .link-fast:hover {
  color: white;
  background-color: #666;
}

.pager .link-fast.disabled:hover {
  color: rgba(102, 102, 102, 0.4);
  background-color: transparent;
}
</style>
