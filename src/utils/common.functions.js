
export const sortByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
  return 0
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

export function getDateOnlyTimestamp(timestamp) {
  if (timestamp) {
    const originalDate = new Date(timestamp)

    const year = originalDate.getUTCFullYear()
    const month = originalDate.getUTCMonth()
    const date = originalDate.getUTCDate()

    const dateOnly = new Date(Date.UTC(year, month, date, 0, 0, 0, 0))

    return dateOnly.getTime()
  }
  return 0
}

