import { store } from '@/store/store'
import { Emitter } from 'mitt'
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { SaveEvent } from './baseComponent'

const collator = new Intl.Collator(['en-US', 'ru-RU'])

function sort(a: { name: string }, b: { name: string }) {
  return collator.compare(a.name.toLowerCase(), b.name.toLowerCase())
}

export function setup<TObject extends { uuid: string; checked?: boolean; editable?: boolean; name: string }>(
  items: Array<TObject>,
  emit?: (event: string, ...args: any[]) => void
) {
  const emitter = inject<
    Emitter<{
      save: SaveEvent
      beforeClose: { uuid: string }
    }>
  >('emitter')

  emitter?.on('beforeClose', onBeforeClose)

  onBeforeUnmount(() => {
    emitter?.off('beforeClose', onBeforeClose)
  })

  const all = ref(false)
  const component = ref<{ item: TObject; hasChanges?: boolean }>()
  const dataItems = ref<Array<TObject>>(JSON.parse(JSON.stringify(items)))
  const pageInfo = ref({
    Page: 1,
    Items: 0,
    Size: store.getters.pageInfo.Size
  })
  const wizard = ref<Object>()

  const filteredItems = computed(() => {
    return dataItems.value.sort(sort)
  })

  // const checkedItems = computed(() => {
  //   return Object.values(dataItems.value).reduce((acc, v: { uuid: string }) => Object.assign(acc, { [v.uuid]: false }), {})
  // })

  const hasSelected = computed(() => dataItems.value.some(r => r.checked === true))

  const localItems = computed(() => {
    const firstIndex = (pageInfo.value.Page - 1) * pageInfo.value.Size
    const lastIndex =
      pageInfo.value.Page * pageInfo.value.Size > filteredItems.value.length ? filteredItems.value.length : pageInfo.value.Page * pageInfo.value.Size

    return filteredItems.value.slice(firstIndex, lastIndex)
  })

  // watch(
  //   () => dataItems.value,
  //   value => {
  //     console.log('watch', Object.values(dataItems.value).reduce((acc, v: { uuid: string }) => Object.assign(acc, { [v.uuid]: false }), {}))
  //   },
  //   { deep: true }
  // )

  watch(
    () => filteredItems.value.length,
    value => (pageInfo.value.Items = value)
  )

  function onBeforeClose(event: { uuid: string }) {
    if (component.value && component.value.item.editable && component.value.item.uuid === event.uuid && component.value.hasChanges) {
      wizard.value = {
        name: 'save',
        component: {
          text: 'Сохранение:',
          component: 'message',
          data: {
            text: 'Данные были изменены. Сохранить изменения?'
          }
        }
      }
    } else {
      component.value = undefined
    }
  }

  function changeAll() {
    dataItems.value.forEach(r => (r.checked = all.value))
  }

  function onChangePage(page: number, size: number) {
    pageInfo.value.Size = size
    pageInfo.value.Page = page
  }

  function viewClick(r: TObject) {
    component.value = {
      item: r
    }
  }

  function onChanged() {
    if (component.value) {
      component.value.hasChanges = true
    }
  }

  function onSaved(item: TObject, close: boolean) {
    if (component.value) {
      component.value.hasChanges = false
    }

    if (close) {
      component.value = undefined
    }

    if (emit) {
      emit('changed', item)
    }
  }

  function onWizardCancel(name: string) {
    wizard.value = undefined

    if (name === 'save') {
      component.value = undefined
    }
  }

  function onWizardEnd(data: TObject, name: string) {
    wizard.value = undefined

    if (name === 'add') {
      if (emit) {
        emit('add', data)
      }
    } else if (name === 'save') {
      if (component.value) {
        emitter?.emit('save', { uuid: component.value.item.uuid, close: true })
      }
    } else if (name === 'remove') {
      if (emit) {
        emit(
          'remove',
          dataItems.value.filter(r => r.checked === true).map(r => r.uuid)
        )
      }
    }
  }

  return {
    all,
    changeAll,
    component,
    dataItems,
    emitter,
    hasSelected,
    localItems,
    onBeforeClose,
    onChanged,
    onChangePage,
    onSaved,
    onWizardCancel,
    onWizardEnd,
    pageInfo,
    viewClick,
    wizard
  }
}
