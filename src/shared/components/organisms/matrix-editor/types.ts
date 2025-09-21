export interface MatrixColumn {
  key: string
  label: string
  requireType?: string
  sticky?: boolean
  editable?: boolean
  iconColorClass?: string
  initialWidth?: number
  valueType?: string
}

export interface MatrixEditorExpose {
  resetHistory: (rows?: any[]) => void
}
