import { store } from '@/store/store'
import { getUserCertificates } from '../crypto/crypto'
import Certificate from '../crypto/certificate'

export const wizardCertificates = async (http, id) => {
  let hasPluginCades = null

  if (store.state.user && store.state.user.userRights.allowCryptSign) {
    await import('../crypto/cadesplugin_api')

    try {
      await window.cadesplugin
      hasPluginCades = true
    } catch (e) {
      hasPluginCades = false
    }
  }

  return {
    name: 'certificate',
    component: {
      text: 'Выбор сертификата:',
      component: 'selector',
      event: 'selectionChanged',
      data: {
        loader: async () => {
          let arr = null

          if (hasPluginCades) {
            const result = await Promise.all([
              getUserCertificates(),
              getCert(http, id),
            ])
            arr = [...result[0].map((r) => new Certificate(r))]
            if (result[1] !== null) {
              arr.push(new Certificate(result[1], false))
            }
          } else {
            const result = await getCert(http, id)
            arr = [new Certificate(result, false)]
          }
          arr.sort((a, b) => sortBy(a, b, 'issuer'))

          if (!arr[0].issuer) {
            arr = []
          }
          
          return arr
        },
        singleMode: true,
        idColumn: 'thumbprint',
        searchColumn: 'issuer',
        columns: [
          {
            prop: 'issuer',
            text: 'Издатель',
          },
          {
            prop: 'validToLocal',
            text: 'Срок действия',
          },
        ],
      },
    },
  }
}

const getCert = async (http, id) => {
  try {
    const abortController = new AbortController()

    const { data } = await http.get(
      'asHelper/certificate',
      { params: { id } },
      { signal: abortController.signal }
    )
    return data.data
  } catch (error) {
    if (!abortController.signal.aborted) {
      store.commit('error', error)
    }
  }
}

const sortBy = (a, b, prop) => {
  if (a[prop] < b[prop]) return -1
  if (a[prop] > b[prop]) return 1
}

export const wizardPassword = () => {
  return {
    name: 'password',
    component: {
      text: 'Ввод пароля:',
      component: 'certPassword',
      event: 'change',
    },
  }
}
