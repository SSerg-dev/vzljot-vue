/* eslint-disable no-extra-semi */
import axios, { AxiosError } from 'axios'
import { Emitter } from 'mitt'
import { store } from '@/store/store'
import { inject, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'

type ValueOf<T> = T[keyof T]

export type SaveEvent = {
  uuid: string
  close: boolean
}

export function setupComponent<
  TObject extends { id?: number; uuid?: string; editable?: boolean },
  TError extends object
>(
  item: TObject,
  error: TError,
  emit?: (event: string, ...args: any[]) => void
) {
  const hasChanges = ref(false)
  const loading = ref(true)
  const localError = ref(error)
  const localItem = ref(item)
  const saving = ref(false)
  const wizard = ref<any>()

  const emitter = inject<
    Emitter<{
      beforeClose: { uuid: string }
      close: { uuid: string }
    }>
  >('emitter')

  emitter?.on('beforeClose', onBeforeClose)

  function onBeforeClose(event: { uuid: string }) {
    if (item.uuid === event.uuid) {
      if (hasChanges.value) {
        wizard.value = {
          data: event,
          name: 'save',
          component: {
            text: 'Сохранение:',
            component: 'message',
            data: {
              text: 'Данные были изменены. Сохранить изменения?',
            },
          },
        }
      } else {
        emitter?.emit('close', { uuid: event.uuid })
      }
    }
  }

  function onWizardCancel() {
    const event = wizard?.value.data
    wizard.value = undefined
    emitter?.emit('close', event)
  }

  function onWizardEnd(data: any, name: string) {
    const event = wizard?.value.data
    wizard.value = undefined
    if (name === 'save') {
      save()
      emitter?.emit('close', event)
    }
  }

  onMounted(async () => {
    try {
      await (localItem.value as any).init(item.id)
      watch(
        () => localItem.value,
        (value) => {
          if (value.hasOwnProperty('editable')) {
            if (value.editable) {
              hasChanges.value = true
            }
          } else {
            hasChanges.value = true
          }
        },
        { deep: true }
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError
        if (error.response?.status !== 552) {
          store.commit('error', error)
        }
      }
    } finally {
      loading.value = false
    }
  })

  onBeforeUnmount(() => {
    emitter?.off('beforeClose', onBeforeClose)
  })

  function onChanged(key: keyof TObject, value: TObject[keyof TObject]) {
    if (localItem.value.hasOwnProperty('editable')) {
      if (localItem.value.editable) {
        ;(localItem.value as any)[key] = value
      }
    } else {
      ;(localItem.value as any)[key] = value
    }
  }

  async function save() {
    try {
      saving.value = true

      localError.value = new (localError.value as any).constructor({})
      await (localItem.value as any).save()
      hasChanges.value = false

      if (emit) {
        emit('saved', unref(localItem))
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError
        if (error.response?.status !== 552) {
          if (error.response?.status === 551) {
            localError.value = error.response.data
          } else {
            store.commit('error', error)
          }
        }
      }
    } finally {
      saving.value = false
    }
  }

  return {
    hasChanges,
    loading,
    localError,
    localItem,
    onChanged,
    onWizardCancel,
    onWizardEnd,
    save,
    saving,
    wizard,
  }
}

export function setupTreeComponent<
  TObject extends object,
  TError extends object
>(uuid: string, id: number, item: TObject, error: TError) {
  const emitter = inject<
    Emitter<{
      beforeNodeChange: { uuid: string; node: any; target: any }
      afterNodeChange: { node: any; target: any }
      'set-params-equip-setting:hasChanges': boolean
    }>
  >('emitter')

  emitter?.on('beforeNodeChange', onBeforeChange)

  const hasChanges = ref(false)
  const loading = ref(true)
  const localError = ref(error)
  const localItem = ref(item)
  const saving = ref(false)
  const wizard = ref<any>()
  const error551PollDataTypeMessage =
    'Необходимо выбрать хотя бы один тип данных.'

  onMounted(async () => {
    emitter?.on(
      'set-params-equip-setting:hasChanges',
      (newHasChanges: boolean) => {
        hasChanges.value = newHasChanges
      }
    )
    try {
      await (localItem.value as any).init(id)

      const options = {
        nodeChange: localItem.value,
      }
      store.commit('setCard', options)

      watch(
        () => localItem.value,
        (value) => {
          if ((value as any).hasOwnProperty('editable')) {
            if ((value as any).editable) {
              hasChanges.value = true
            }
          } else {
            hasChanges.value = true
          }
        },
        { deep: true }
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError
        if (error.response?.status !== 552) {
          store.commit('error', error)
        }
      }
    } finally {
      loading.value = false
    }
  })

  onBeforeUnmount(() => {
    emitter?.off('beforeNodeChange', onBeforeChange)
    emitter?.off('set-params-equip-setting:hasChanges')
  })

  function onBeforeChange(event: { uuid: string; node: any; target: any }) {
    if (event.uuid === uuid) {
      if (hasChanges.value) {
        wizard.value = {
          event,
          name: 'save',
          component: {
            text: 'Сохранение:',
            component: 'message',
            data: {
              text: 'Данные были изменены. Сохранить изменения?',
            },
          },
        }
      } else {
        emitter?.emit('afterNodeChange', {
          node: event.node,
          target: event.target,
        })
      }
    }
  }

  function onWizardEnd(data: any, name: string) {
    const event = wizard?.value.event
    wizard.value = undefined
    if (name === 'save') {
      save()
      emitter?.emit('afterNodeChange', {
        node: event.node,
        target: event.target,
      })
    }
  }

  function onWizardCancel() {
    const event = wizard?.value.event
    wizard.value = undefined
    emitter?.emit('afterNodeChange', { node: event.node, target: event.target })
  }

  async function save() {
    try {
      saving.value = true

      localError.value = new (localError.value as any).constructor({})
      const response = await (localItem.value as any).save()

      hasChanges.value = false
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError
        if (error.response?.status !== 552) {
          if (error.response?.status === 551) {
            localError.value = error.response.data
            if (
              error.response.data.pollDataType === error551PollDataTypeMessage
            ) {
              const options = {
                title: 'Ошибка типа данных',
                type: 'error',
                text: error.response.data.pollDataType,
              }
              notify(options)
            }
          } else {
            store.commit('error', error)
          }
        }
      }
    } finally {
      saving.value = false
    }
  }

  function notify(options: object) {
    store.commit('notification', options)
  }

  function onChanged<Key extends keyof TObject>(
    key: Key,
    value: ValueOf<TObject>
  ) {
    if ((localItem.value as any).hasOwnProperty('editable')) {
      if ((localItem.value as any).editable) {
        ;(localItem.value as any)[key] = value
      }
    } else {
      ;(localItem.value as any)[key] = value
    }
  }

  return {
    hasChanges,
    loading,
    localError,
    localItem,
    onChanged,
    onWizardCancel,
    onWizardEnd,
    save,
    saving,
    wizard,
  }
}
