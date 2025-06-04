export enum SchemeSystemTypeEnum {
  None = 0,
  SO = 1,
  GVS = 2,
  HVS = 4,
  ES = 8,
  GS = 16,
  PS = 32,
  MS = 64,
  Refill = 128,
  SV = 256,
  Level = 512,
  Pressure = 1024,
  Temperature = 2048,
  STV = 4096,

  SO_GVS = SO | GVS,
  SO_Refill = SO | Refill,
  GVS_Refill = GVS | Refill,
  SO_GVS_Refill = SO | GVS | Refill,
  SO_GVS_HVS = SO | GVS | HVS,
  SO_GVS_Refill_HVS = SO | GVS | Refill | HVS,
  SV_Refill = SV | Refill,
  SO_Refill_HVS = SO | Refill | HVS,
  GVS_Refill_HVS = GVS | Refill | HVS,
  PS_GVS = PS | GVS,
  HVS_PS = HVS | PS,
  SO_GVS_HVS_Refill_SV = SO | GVS | HVS | Refill | SV,

  All = SO |
    GVS |
    HVS |
    ES |
    GS |
    PS |
    MS |
    Refill |
    SV |
    Level |
    Pressure |
    Temperature |
    STV,
}
