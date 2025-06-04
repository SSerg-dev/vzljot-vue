onmessage = function (e) {
  let data = JSON.parse(e.data)

  if (Object.prototype.hasOwnProperty.call(data, 'toAdd')) {
    Object.keys(data.toAdd).forEach(key => {
      data.toAdd[key].forEach(r =>
        postMessage({
          event: 'add',
          type: parseInt(key),
          item: r
        }))
    })
  }

  if (Object.prototype.hasOwnProperty.call(data, 'toUpdate')) {
    Object.keys(data.toUpdate).forEach(key => {
      data.toUpdate[key].forEach(r =>
        postMessage({
          event: 'update',
          type: parseInt(key),
          item: r
        }))
    })
  }

  if (Object.prototype.hasOwnProperty.call(data, 'toDelete')) {
    Object.keys(data.toDelete).forEach(key => {
      data.toDelete[key].forEach(r =>
        postMessage({
          event: 'delete',
          type: parseInt(key),
          item: r
        }))
    })
  }

  if (Object.prototype.hasOwnProperty.call(data, 'statistic')) {
    postMessage({
      event: 'statistic',
      points: data.statistic.points,
      equips: data.statistic.equips,
      pointLists: data.statistic.pointLists,
      equipLists: data.statistic.equipLists
    })
  }

  if (Object.prototype.hasOwnProperty.call(data, 'notifications')) {
    postMessage({
      event: 'notifications',
      count: data.notifications
    })    
  }
}
