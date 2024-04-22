import { Emitter } from 'mitt'
import { inject, onMounted, ref, watch } from 'vue'
import { SaveEvent } from './baseComponent'

export function setup<TObject extends { id?: number; uuid?: string; editable: boolean; validate(items: Array<TObject> | undefined): TError }, TError extends object>(
  item: TObject,
  error: TError,
  items: Array<TObject> | undefined,
  emit: (event: string, ...args: any[]) => void
) {
  const hasChanges = ref(false)
  const localError = ref(error)
  const localItem = ref(item)
  const saving = ref(false)

  const emitter = inject<Emitter<{ save: SaveEvent }>>('emitter')

  emitter?.on('save', event => save(event))

  onMounted(async () => {
    watch(
      () => localItem,
      () => {
        if (localItem.value.editable) {
          hasChanges.value = true
          emit('changed')
        }
      },
      { deep: true }
    )
  })

  function onChanged(key: keyof TObject, value: TObject[keyof TObject]) {
    if (localItem.value.editable) {
      (localItem.value as any)[key] = value
    }
  }

  function save({ uuid, close }: SaveEvent) {
    if (localItem.value.uuid === uuid) {
      saving.value = true;

     (localError as any).value = localItem.value.validate(items)

      if (Object.values((localError as any).value).filter(r => r).length === 0) {
        hasChanges.value = false
        emit('saved', localItem.value, close)
      }

      saving.value = false
    }
  }

  return {
    hasChanges,
    localError,
    localItem,
    onChanged,
    save,
    saving
  }
}
