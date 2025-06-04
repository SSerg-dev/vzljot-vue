import { SchemeSystemTypeEnum } from '@/classes/enum/SchemeSystemTypeEnum'

export function getSystemImage(type?: number) {
  switch (type) {
    case SchemeSystemTypeEnum.Level:
      return 'point-level'
    case SchemeSystemTypeEnum.Pressure:
      return 'point-pressure'
    case SchemeSystemTypeEnum.Refill:
      return 'point-refill'
    case SchemeSystemTypeEnum.STV:
      return 'point-stv'
    case SchemeSystemTypeEnum.SV:
      return 'point-sv'
    case SchemeSystemTypeEnum.ES:
      return 'point-electric'
    case SchemeSystemTypeEnum.GS:
      return 'point-gas'
    case SchemeSystemTypeEnum.GVS:
      return 'point-gvs'
    case SchemeSystemTypeEnum.GVS_Refill:
      return 'point-gvsrefill'
    case SchemeSystemTypeEnum.HVS:
      return 'point-hvs'
    case SchemeSystemTypeEnum.PS:
      return 'point-ps'
    case SchemeSystemTypeEnum.SO:
      return 'point-so'
    case SchemeSystemTypeEnum.SO_Refill:
      return 'point-sorefill'
    case SchemeSystemTypeEnum.SO_GVS:
      return 'point-sogvs'
    case SchemeSystemTypeEnum.SO_GVS_Refill:
      return 'point-sogvsrefill'
    case SchemeSystemTypeEnum.PS | SchemeSystemTypeEnum.GVS:
      return 'point-psgvs'
    case SchemeSystemTypeEnum.SV_Refill:
      return 'point-svrefill'
    case SchemeSystemTypeEnum.SO_GVS_Refill_HVS:
      return 'point-sogvsrefillhvs'
    case SchemeSystemTypeEnum.SO_GVS_HVS:
      return 'point-sogvshvs'
    case SchemeSystemTypeEnum.GVS_Refill_HVS:
      return 'point-gvsrefillhvs'
    case SchemeSystemTypeEnum.PS_GVS:
      return 'point-psgvs'
    case SchemeSystemTypeEnum.HVS_PS:
      return 'point-common' //'point-hvsps'
    case SchemeSystemTypeEnum.SO_GVS_HVS_Refill_SV:
      return 'point-common'//'point-sogvshvsrefillsv' 

    default:
      return 'point-common'
  }
}
