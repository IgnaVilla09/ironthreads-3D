export type Sector = 'body_front' | 'body_back' | 'sleeve_left' | 'sleeve_right'

export type ShirtModel = 'shirt_nuevo' | 'oversize' | 'croptop' | 'longtop' | 'hoodie'

export const SHIRT_MODEL_LABELS: Record<ShirtModel, string> = {
  shirt_nuevo: 'Clasica',
  oversize: 'Oversize',
  croptop: 'Crop Top',
  longtop: 'Long Top',
  hoodie: 'Hoodie',
}

export const SHIRT_MODEL_LIST: ShirtModel[] = ['shirt_nuevo', 'oversize', 'croptop', 'longtop', 'hoodie']

export const SECTOR_LABELS: Record<Sector, string> = {
  body_front: 'Frente',
  body_back: 'Espalda',
  sleeve_left: 'Manga izquierda',
  sleeve_right: 'Manga derecha',
}

export const SECTOR_LIST: Sector[] = [
  'body_front',
  'body_back',
  'sleeve_left',
  'sleeve_right',
]

export const SECTOR_TO_NODE: Record<Sector, string> = {
  body_front: 'Object_4.002',
  body_back: 'Object_4.001',
  sleeve_left: 'Object_4.004',
  sleeve_right: 'Object_4.003',
}

export interface DecalConfig {
  id: string
  image: string
  imageWidth: number
  imageHeight: number
  position: [number, number, number]
  scale: number
  rotation: number
}

export type DecalsBySector = Record<Sector, DecalConfig[]>

export interface EstimatedDecalMeasurements {
  widthCm: number
  heightCm: number
}

export interface ExportedDecalConfig extends DecalConfig {
  estimatedMeasurements: EstimatedDecalMeasurements
}

export interface CaptureAngle {
  angle: number
  dataUrl: string
}

export interface ShirtConfig {
  selectedModel: ShirtModel
  shirtColor: string
  garmentMeasurementsCm: {
    height: number
    width: number
  }
  decals: Partial<Record<Sector, ExportedDecalConfig[]>>
}
