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
  nodeChange: any | null
  nodeCreate: any | null
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
  nodeChange: null,
  nodeCreate: null,
}


