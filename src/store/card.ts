export interface Card {
  isCardSelected: boolean | null
  isInfoChanged: boolean | null
  viewData: Object | null
  selectedNodeId: number | null
  selectedLastNodeId: number | null
  modifications: [] | null
  interval: 0 | null
  equipTypeModificationId: number | null
  timeLastChecking: number | null
  timeNextChecking: number | null
  startTimeLastChecking: number | null
  startTimeNextChecking: number | null
  nodeChange: any | null
  nodeCreate: any | null
  isNodeCreate: boolean | null
}

export const card: Card = {
  isCardSelected: false,
  isInfoChanged: false,
  viewData: {},
  selectedNodeId: null,
  selectedLastNodeId: null,
  modifications: [],
  interval: 0,
  equipTypeModificationId: null,
  timeLastChecking: null,
  timeNextChecking: null,
  startTimeLastChecking: null,
  startTimeNextChecking: null,
  nodeChange: null,
  nodeCreate: null,
  isNodeCreate: false
}


