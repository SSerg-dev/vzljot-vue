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

/*
export const moduleCard = {
  state: () => ({
    card: {
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
    },
  }),
  mutations: {
    setCard(state: any, payload: any) {
      if (typeof payload.isCardSelected === 'boolean')
        state.card.isCardSelected = payload.isCardSelected
      if (typeof payload.isInfoChanged === 'boolean')
        state.card.isInfoChanged = payload.isInfoChanged
      if (payload.viewData) state.card.viewData = payload.viewData
      if (payload.selectedNodeId)
        state.card.selectedNodeId = payload.selectedNodeId
      if (payload.selectedLastNodeId)
        state.card.selectedLastNodeId = payload.selectedLastNodeId
      if (payload.modifications)
        state.card.modifications = payload.modifications
      if (payload.interval) state.card.interval = payload.interval
      if (payload.equipTypeModificationId)
        state.card.equipTypeModificationId = payload.equipTypeModificationId
      if (payload.timeLastChecking)
        state.card.timeLastChecking = payload.timeLastChecking
      if (payload.timeNextChecking)
        state.card.timeNextChecking = payload.timeNextChecking
      if (payload.nodeChange) state.card.nodeChange = payload.nodeChange
      if (payload.nodeCreate) state.card.nodeCreate = payload.nodeCreate
    },
  },
  getters: {
    getCard: (state: any) => {
      return {
        isCardSelected: state.card.isCardSelected,
        isInfoChanged: state.card.isInfoChanged,
        viewData: state.card.viewData,
        selectedNodeId: state.card.selectedNodeId,
        selectedLastNodeId: state.card.selectedLastNodeId,
        modifications: state.card.modifications,
        interval: state.card.interval,
        equipTypeModificationId: state.card.equipTypeModificationId,
        timeLastChecking: state.card.timeLastChecking,
        timeNextChecking: state.card.timeNextChecking,
        nodeChange: state.card.nodeChange,
        nodeCreate: state.card.nodeCreate,
      }
    },
  },
  actions: {},
}
*/
