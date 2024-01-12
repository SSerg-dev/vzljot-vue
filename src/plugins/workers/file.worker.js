const chunkSize = 1024 * 1024 // 1Mb

onmessage = async function (e) {
  try {
    let { id, type, files, baseUrl } = e.data

    for (const file of files.filter(r => r.size / 1024 / 1024 < 50)) {
      let fileData = await http(`${baseUrl}fileList/createFile?id=${id}&type=${type}&fileName=${file.name}&lastModified=${file.lastModified}`)

      let startByte = 0

      postMessage({
        message: 'progress',
        fileName: file.name,
        percent: 0
      })

      while (startByte < file.size) {
        let chunk = file.slice(startByte, startByte + chunkSize)
        await http(`${baseUrl}fileList/uploadChunk?id=${fileData.data.id}&type=${type}`, chunk)
        startByte = startByte + chunkSize

        postMessage({
          message: 'progress',
          fileName: file.name,
          percent: Math.round((Math.ceil(startByte / chunkSize) + 1) / Math.ceil(file.size / chunkSize) * 100)
        })
      }

      postMessage({
        message: 'fileEnd',
        file,
        id: fileData.data.id,
        type
      })
    }

    postMessage({
      message: 'end'
    })
  } catch (error) {
    postMessage({
      message: 'error',
      error: error
    })
  }
}

function http (url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.responseType = 'json'
    xhr.setRequestHeader('Cache-Control', 'no-cache')

    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response)
      } else {
        var error = new Error(this.statusText)
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
