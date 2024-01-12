export interface IRedirectEndPointProperties {
  redirectEndPointIdKnown?: string
  redirectEndPointIdUnknown?: string
}

export class RedirectEndPointProperties {
  redirectEndPointIdKnown?: string
  redirectEndPointIdUnknown?: string

  constructor({
    redirectEndPointIdKnown = undefined,
    redirectEndPointIdUnknown = undefined
  }: IRedirectEndPointProperties) {
    this.redirectEndPointIdKnown = redirectEndPointIdKnown
    this.redirectEndPointIdUnknown = redirectEndPointIdUnknown
  }
}