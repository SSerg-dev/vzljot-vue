
import Item from './item.js'
import Drawing from './drawing'
import Cone from './cone'
import Table from './table'
import Chart from './chart'
import Image from './image'

export default class Factory {
  create (item, key) {
    if (item.Type === 'simpleGrphObj') {
      if (item.TypeObj === 'cone') {
        return new Cone(item, key)
      }
      return new Drawing(item, key)
    } else if (item.Type === 'paramGrph') {
      return new Chart(item, key)
    } else if (item.Type === 'paramTbl') {
      return new Table(item, key)
    } else if (item.Type === 'simplePict') {
      return new Image(item, key)
    } else {
      return new Item(item, key)
    }
  }
}