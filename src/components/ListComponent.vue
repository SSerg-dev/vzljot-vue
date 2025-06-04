<script>
import { ModemPool } from '@/classes/modemPool'
import { matchType, getImage } from '../plugins/api.js'

export default {
  props: {
    items: {
      type: Array,
      default: () => [], 
    },
  },
  data() {
    return {
      dataItems: this.items,
      all: false,
      filter: this.emptyFilter(),
      pageInfo: {
        Page: 1,
        Items: 0,
        Size: this.$store.getters.pageInfo.Size,
      },
    }
  },
  created() {
    this.$emitter.on('updateObject', this.onUpdate)
    this.$emitter.on('deleteObject', this.onDelete)

    this.$watch(
      () => this.items,
      (value) => (this.dataItems = value)
    )

    this.$watch(
      () => this.filter,
      () => {
        this.pageInfo.Page = 1
      },
      { deep: true }
    )

    this.$watch(
      () => this.filteredItems.length,
      (value) => {
        if (!('get' in this)) {
          this.pageInfo.Items = value
        }
      }
    )

    this.$watch(
      '$store.state.equip.equipEvent.hasEmptyDateSet',
      (value) => {
        value
          ? (this.pageInfo.Items = 0)
          : (this.pageInfo.Items = this.filteredItems.length)
      },
      { deep: true }
    )

    this.pageInfo.Items = this.filteredItems.length
  },
  async mounted() {
    if ('get' in this) {
      await this.get(1, this.pageInfo.Size)
    }
  },
  beforeUnmount() {
    this.$emitter.off('updateObject', this.onUpdate)
    this.$emitter.off('deleteObject', this.onDelete)
  },
  computed: {
    hasSelected() {
      return this.dataItems.some((r) => r.checked === true)
    },
    filteredItems() {
      return 'get' in this
        ? this.dataItems.slice(0)
        : this.dataItems.slice(0).sort(this.sort)
    },
    localItems() {
      if ('get' in this && typeof this.get === 'function') {
        return this.filteredItems
      } else {
        const firstIndex = (this.pageInfo.Page - 1) * this.pageInfo.Size
        const lastIndex =
          this.pageInfo.Page * this.pageInfo.Size > this.filteredItems.length
            ? this.filteredItems.length
            : this.pageInfo.Page * this.pageInfo.Size

        

        return this.filteredItems.slice(firstIndex, lastIndex)
      }
    },
    hasFilterChanges() {
      const filter = this.emptyFilter()
      return Object.keys(filter).some((r) => this.filter[r] !== filter[r])
    },
  },
  methods: {
    emptyFilter() {
      return {
        name: null,
      }
    },
    onUpdate() {},
    onDelete() {},
    sort(a, b) {
      return this.$store.state.collator.compare(
        a.name.toLowerCase(),
        b.name.toLowerCase()
      )
    },
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page

      if ('get' in this && typeof this.get === 'function') {
        this.get(page, size)
      }
    },
    changeAll() {
      this.dataItems.forEach((r) => (r.checked = this.all))
    },
    getImage(item) {
      return item instanceof ModemPool ? item.image : getImage.call(this, item)
    },
    onClearFilterClick() {
      this.filter = this.emptyFilter()

      if ('get' in this) {
        this.get(1, this.pageInfo.Size)
      }
    },
    matchType(types) {
      return matchType(types)
    },
  },
}
</script>
