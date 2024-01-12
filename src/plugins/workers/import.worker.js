const chunkSize = 1024 * 1024 // 1Mb

onmessage = async function (e) {
  try {
    const { file, baseUrl } = e.data

    let guid = null
    let systemNode = null
    let systemNodes = null
    let items = null

    let startByte = 0

    while (startByte < file.size) {
      const url = startByte ? `${baseUrl}import/upload?guid=${guid}&size=${file.size}` : `${baseUrl}import/upload?size=${file.size}`

      const data = await http(url, file.slice(startByte, startByte + chunkSize))

      guid = data.guid
      systemNode = data.systemNode
      systemNodes = data.systemNodes
      items = data.items

      startByte = startByte + chunkSize

      postMessage({
        message: 'progress',
        percent: Math.round(((startByte < file.size ? startByte : file.size) / file.size) * 100)
      })
    }

    items.forEach(r => r.checked = false)

    postMessage({
      message: 'end',
      guid,
      systemNode,
      systemNodes,
      items
    })
  } catch (error) {
    postMessage({
      message: 'error',
      error
    })
  }
}

function http(url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.responseType = 'json'
    xhr.setRequestHeader('Cache-Control', 'no-cache')

    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response)
      } else {
        var error = new Error(this.response.message)
        error.code = this.status
        reject(error)
      }
    }

    xhr.onerror = function () {
      reject(new Error('Взлет СП: ошибка сети'))
    }

    data ? xhr.send(data) : xhr.send()
  })
}
