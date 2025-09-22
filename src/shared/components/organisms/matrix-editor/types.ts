export interface MatrixColumn {
  key: string
  label: string
  requireType?: string
  sticky?: boolean
  editable?: boolean
  iconColorClass?: string
  initialWidth?: number
  valueType?: string
  beforeInsert?: () => void
  afterInsert?: () => void
}

export interface MatrixEditorExpose {
  resetHistory: (rows?: any[]) => void
}
