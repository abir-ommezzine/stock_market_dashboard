export interface Dataset {
  id: number
  userId: number
  fileName: string
  filePath?: string
  apirl?: string
  sourceName: string
  sourceType: "FILE"|"PREDEFINED"|"API"
  createdAt: string
}