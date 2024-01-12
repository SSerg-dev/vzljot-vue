import { matcher } from './regexp'

export default class Export {
  constructor(http) {
    this.http = http
  }

  async get(url, value, view = false) {
    const config = {
      url,
      params: value,
      method: 'get',
      responseType: 'blob'
    }

    await perform(this.http, config, view)
  }

  async post(url, value, view = false) {
    const config = {
      url,
      data: value,
      method: 'post',
      responseType: 'blob'
    }

    await perform(this.http, config, view)
  }

  exportBlob(blob, fileName) {
    exportBlob(blob, fileName)
  }
}

async function perform(http, config, view) {
  const { headers, data } = await http(config)

  const base64 = matcher.contentDescriptionFileName.exec(decodeURIComponent(headers['content-disposition']))[1]

  const blob = new Blob([data], {
    type: headers['content-type']
  })

  exportBlob(blob, base64, view)
}

function exportBlob(blob, base64FileName, view) {
  const href = window.URL.createObjectURL(blob)
  const fileName = new TextDecoder('utf-8').decode(base64ToUint8Array(base64FileName))

  if (view) {
    window.open(href, '_blank')
  } else {
    downLoad(href, fileName)
  }

  window.URL.revokeObjectURL(href)
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export const exportSvg = (type, file, svg, canvas) => {
  let fileName = `${file}.${type}`
  switch (type) {
    case 'jpeg':
    case 'png':
      {
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let image = new Image()
        image.onload = () => {
          ctx.drawImage(image, 0, 0)
          let href = canvas.toDataURL(`image/${type}`)
          downLoad(href, fileName)
        }
        image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))        
      }

      break
    case 'svg':
      {
        let blob = new Blob([svg], {
          type: 'image/svg+xml'
        })
        let href = window.URL.createObjectURL(blob)
        downLoad(href, fileName)
        window.URL.revokeObjectURL(href)        
      }

      break
    default:
      break
  }
}

const downLoad = (href, fileName) => {
  let link = document.createElement('a')
  link.style.display = 'none'
  link.href = href
  link.setAttribute('download', fileName)

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
