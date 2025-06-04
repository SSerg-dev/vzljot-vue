export const sortByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
  return 0
}

export const sortByText = (a, b) => {
  if (a.text.toLowerCase() < b.text.toLowerCase()) return -1
  if (a.text.toLowerCase() > b.text.toLowerCase()) return 1
  return 0
}

export function debounce(fn, wait) {
  let timeout
  return function (...args) {
    const later = () => {
      clearTimeout(timeout)
      fn.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function sleep(ms) {
  return new Promise((resolve) => {
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

export function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  }, 2);
}

/*
const items = [
  { id: 1, name: 'Root 1', parentId: null },
  { id: 2, name: 'Child 1.1', parentId: 1 },
  { id: 3, name: 'Child 1.2', parentId: 1 },
  { id: 4, name: 'Child 2.1', parentId: 2 },
  { id: 5, name: 'Root 2', parentId: null },
  { id: 6, name: 'Child 2.1', parentId: 5 },
]

// Recursive function to build the tree
export function buildTree(data, parentId = null) {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(data, item.id), // Recursively build children
    }))
}

// Build the tree
const tree = buildTree(items)

console.log(JSON.stringify(tree, null, 2))

*/
