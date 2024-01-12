type ModificationType = {
  id: number | null
  name: string
  isTemperature: boolean
  isPressure: boolean
  isVolume: boolean
  isWeight: boolean
  isSystem: boolean
  diameter: number | null
  accuracyClass: string
  accuracy: number | null
  tmin: number | null
  tmax: number | null
  pmin: number | null
  pmax: number | null
  gvmin: number | null
  gvmax: number | null
  gmmin: number | null
  gmmax: number | null
}

export default class Modification {
  id: number | null
  name: string
  isTemperature: boolean
  isPressure: boolean
  isVolume: boolean
  isWeight: boolean
  isSystem: boolean
  diameter: number | null
  accuracyClass: string
  accuracy: number | null
  tmin: number | null
  tmax: number | null
  pmin: number | null
  pmax: number | null
  gvmin: number | null
  gvmax: number | null
  gmmin: number | null
  gmmax: number | null

  constructor({
    id = null,
    name = '',
    isTemperature = false,
    isPressure = false,
    isVolume = false,
    isWeight = false,
    isSystem = false,
    diameter = null,
    accuracyClass = '',
    accuracy = null,
    tmin = null,
    tmax = null,
    pmin = null,
    pmax = null,
    gvmin = null,
    gvmax = null,
    gmmin = null,
    gmmax = null
  }: ModificationType) {
    this.id = id
    this.name = name
    this.isTemperature = isTemperature
    this.isPressure = isPressure
    this.isVolume = isVolume
    this.isWeight = isWeight
    this.isSystem = isSystem
    this.diameter = diameter
    this.accuracyClass = accuracyClass
    this.accuracy = accuracy
    this.tmin = tmin
    this.tmax = tmax
    this.pmin = pmin
    this.pmax = pmax
    this.gvmin = gvmin
    this.gvmax = gvmax
    this.gmmin = gmmin
    this.gmmax = gmmax
  }
}
