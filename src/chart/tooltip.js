export class Tooltip {
  constructor(el) {
    this.el = el
  }

  show({ top, left }, data) {
    const TOP = 20
    const LEFT = 40

    if (!Object.keys(data).length) {
      return
    }

    const parentRect = this.el.parentNode.getBoundingClientRect()
    const rect = this.el.getBoundingClientRect()

    this.el.innerHTML = ''

    this.el.style.display = 'block'
    this.el.style.top = `${parentRect.height > top + rect.height + TOP ? top + TOP : top - rect.height - TOP}px`
    this.el.style.left = `${parentRect.width > left + rect.width + LEFT ? left + LEFT : left - rect.width - LEFT}px`

    this.el.insertAdjacentHTML(
      'afterbegin',
      `
      <div class="title">${data.title}</div>
      <div class="grid">
        ${data.items
          .map(r => {
            return `
            <div class="name" style="color: ${r.color}">${r.name}:</div>
            <div class="value">${r.value}</div>`
          })
          .join(' ')}
      </div>
    `
    )
  }

  hide() {
    this.el.style.display = 'none'
  }
}
