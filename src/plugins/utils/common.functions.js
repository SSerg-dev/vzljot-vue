
export const sortByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
}


export function debounce(fn, wait) {
  let timeout
  return function(...args) {
    const later = () => {
      clearTimeout(timeout)
      fn.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

  } 
}

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms)
  })
}
/*
sleep(4000).then(() => {
  console.log('run after 4 sec')
})
*/

/*
const getState = (id) => {
    const result = store.state.equip.equipChildren.find((r) => r.id === id)
    return result ? result.state : 0
  }
*/
