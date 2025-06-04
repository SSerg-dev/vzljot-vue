export interface Balance {
  balanceGroupItem: Array<object>
}

export const balance: Balance = {
  balanceGroupItem: [],
}

export interface BalanceGroupSort {
  id: number
  type: number
  name: string
  originName: string
  subGroup: number
  state: number
}
