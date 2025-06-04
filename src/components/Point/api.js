export const nonEditableStyle = {
  'background-color': '#f9fbfd'
}

export const setPosition = (target, container, el) => {
  let cellBox = target.getBoundingClientRect()
  let contBox = container.getBoundingClientRect()
  el.style.top = `${(cellBox.top - contBox.top + pageYOffset)}px`
  el.style.left = `${(cellBox.left - contBox.left + pageXOffset)}px`
  el.style.width = `${cellBox.width}px`
  el.style.height = `${cellBox.height}px`
}