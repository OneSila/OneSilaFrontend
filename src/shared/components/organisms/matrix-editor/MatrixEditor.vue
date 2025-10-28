<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Flex, FlexCell } from '../../layouts/flex'
import { Button } from '../../atoms/button'
import { Icon } from '../../atoms/icon'
import { LocalLoader } from '../../atoms/local-loader'
import { Toast } from '../../../modules/toast'
import type { MatrixColumn, MatrixEditorExpose } from './types'
import { PropertyTypes } from '../../../utils/constants'

interface ClipboardValue {
  column: string
  columnType?: string
  value: any
}

interface RowClipboardValue {
  values: Record<string, ClipboardValue>
}

const props = withDefaults(
  defineProps<{
    columns: MatrixColumn[]
    rows: any[]
    rowKey?: string
    loading?: boolean
    hasChanges?: boolean
    getCellValue: (rowIndex: number, columnKey: string) => any
    setCellValue: (rowIndex: number, columnKey: string, value: any) => void
    cloneCellValue: (fromRow: number, toRow: number, columnKey: string) => void
    clearCellValue: (rowIndex: number, columnKey: string) => void
    onCtrlArrow?: (rowIndex: number, columnKey: string, direction: 'left' | 'right') => boolean | void
  }>(),
  {
    rowKey: 'id',
    loading: false,
    hasChanges: false,
  }
)

const emit = defineEmits<{
  (e: 'update:rows', value: any[]): void
  (e: 'save'): void
}>()

const { t } = useI18n()

const tableWrapper = ref<HTMLElement | null>(null)
const selectedCell = ref<{ row: number | null; col: string | null }>({ row: null, col: null })
const selectedRange = ref<{ row: number | null; columns: string[] }>({ row: null, columns: [] })
const selectionAnchor = ref<{ row: number | null; col: string | null }>({ row: null, col: null })
const selectionDrag = reactive<{ active: boolean; row: number | null; startCol: string | null }>(
  {
    active: false,
    row: null,
    startCol: null,
  }
)
const SELECTION_SCROLL_EDGE_THRESHOLD = 40
const SELECTION_SCROLL_STEP = 30
let selectionAutoScrollFrame: number | null = null
let selectionAutoScrollDirection: -1 | 0 | 1 = 0
let lastPointerPosition: { x: number; y: number } | null = null
const clipboard = ref<ClipboardValue | null>(null)
const rowClipboard = ref<RowClipboardValue | null>(null)
const dragState = reactive({
  active: false,
  startRow: null as number | null,
  endRow: null as number | null,
  cols: [] as string[],
})
const history = ref<any[]>([])
const redoStack = ref<any[]>([])
const skipHistory = ref(false)
const lastSnapshot = ref<string>(JSON.stringify(toRaw(props.rows ?? [])))

const columnWidths = reactive<Record<string, number>>({})
const rows = computed(() => props.rows ?? [])
const hasRowClipboard = computed(() => rowClipboard.value !== null)
const getValue = (rowIndex: number, columnKey: string) =>
  props.getCellValue(rowIndex, columnKey)

const getDefaultColumnWidth = (column: MatrixColumn) =>
  column.initialWidth != null ? column.initialWidth : column.key === 'active' ? 60 : 150

const hasInsertAction = (columnIndex: number) => {
  const column = props.columns[columnIndex]
  const nextColumn = props.columns[columnIndex + 1]
  return Boolean(nextColumn?.beforeInsert || column?.afterInsert)
}

const handleInsertClick = (columnIndex: number) => {
  const nextColumn = props.columns[columnIndex + 1]
  if (nextColumn?.beforeInsert) {
    nextColumn.beforeInsert()
    return
  }
  const column = props.columns[columnIndex]
  column?.afterInsert?.()
}

watch(
  () => props.columns,
  (cols) => {
    cols.forEach((col) => {
      if (!columnWidths[col.key]) {
        columnWidths[col.key] = getDefaultColumnWidth(col)
      }
    })
  },
  { immediate: true }
)

const stickyOffsets = computed(() => {
  const offsets: Record<string, number> = {}
  let currentOffset = 0
  props.columns.forEach((col) => {
    if (col.sticky) {
      const width = columnWidths[col.key] ?? getDefaultColumnWidth(col)
      offsets[col.key] = currentOffset
      currentOffset += width
    }
  })
  return offsets
})

const canUndo = computed(() => history.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

watch(
  rows,
  (newVal) => {
    if (skipHistory.value) {
      lastSnapshot.value = JSON.stringify(toRaw(newVal))
      return
    }
    history.value.push(JSON.parse(lastSnapshot.value))
    if (history.value.length > 20) history.value.shift()
    redoStack.value = []
    lastSnapshot.value = JSON.stringify(toRaw(newVal))
  },
  { deep: true }
)

const getColumnIndex = (columnKey: string) =>
  props.columns.findIndex((column) => column.key === columnKey)

const sortColumnsByIndex = (columns: string[]) =>
  [...columns].sort((a, b) => getColumnIndex(a) - getColumnIndex(b))

const getColumnType = (columnKey: string) =>
  props.columns.find((column) => column.key === columnKey)?.valueType

const getColumnsForOperation = (rowIndex: number, columnKey: string) => {
  if (
    selectedRange.value.row === rowIndex &&
    selectedRange.value.columns.includes(columnKey)
  ) {
    return selectedRange.value.columns
  }
  return [columnKey]
}

const isCellSelected = (rowIndex: number, columnKey: string) =>
  selectedRange.value.row === rowIndex &&
  selectedRange.value.columns.includes(columnKey)

const isActiveCell = (rowIndex: number, columnKey: string) =>
  selectedCell.value.row === rowIndex && selectedCell.value.col === columnKey

const isDragHandleCell = (rowIndex: number, columnKey: string) => {
  if (!isEditableColumn(columnKey)) return false
  if (selectedRange.value.row === rowIndex && selectedRange.value.columns.length) {
    const ordered = sortColumnsByIndex(selectedRange.value.columns)
    return ordered[ordered.length - 1] === columnKey
  }
  return isActiveCell(rowIndex, columnKey)
}

const selectCell = (rowIndex: number, columnKey: string, event?: MouseEvent) => {
  const colIndex = getColumnIndex(columnKey)
  if (colIndex === -1) return

  if (
    event?.shiftKey &&
    selectionAnchor.value.row === rowIndex &&
    selectionAnchor.value.col &&
    getColumnIndex(selectionAnchor.value.col) !== -1
  ) {
    const anchorIndex = getColumnIndex(selectionAnchor.value.col)
    const [start, end] = anchorIndex < colIndex ? [anchorIndex, colIndex] : [colIndex, anchorIndex]
    const keys = props.columns.slice(start, end + 1).map((column) => column.key)
    selectedRange.value = { row: rowIndex, columns: sortColumnsByIndex(keys) }
  } else {
    selectedRange.value = { row: rowIndex, columns: [columnKey] }
    selectionAnchor.value = { row: rowIndex, col: columnKey }
  }

  selectedCell.value = { row: rowIndex, col: columnKey }
}

const isInteractiveElement = (element: EventTarget | null) => {
  if (!element || !(element instanceof HTMLElement)) return false
  const interactiveSelector = 'input,textarea,select,button,[contenteditable="true"]'
  return !!element.closest(interactiveSelector)
}

const beginSelectionDrag = (rowIndex: number, columnKey: string, event: MouseEvent) => {
  if (event.button !== 0 || event.shiftKey) return
  if (isInteractiveElement(event.target)) return

  selectionDrag.active = true
  selectionDrag.row = rowIndex
  selectionDrag.startCol = columnKey
  selectedCell.value = { row: rowIndex, col: columnKey }
  selectedRange.value = { row: rowIndex, columns: [columnKey] }
  selectionAnchor.value = { row: rowIndex, col: columnKey }
  lastPointerPosition = { x: event.clientX, y: event.clientY }
  document.addEventListener('mouseup', stopSelectionDrag)
  document.addEventListener('mousemove', onSelectionDragMove)
}

const extendSelectionDrag = (rowIndex: number, columnKey: string, event: MouseEvent) => {
  if (!selectionDrag.active || selectionDrag.row !== rowIndex) return
  if (event.buttons === 0) {
    stopSelectionDrag()
    return
  }
  lastPointerPosition = { x: event.clientX, y: event.clientY }
  updateSelectionDrag(columnKey)
  handleSelectionAutoScroll(event)
  event.preventDefault()
}

const hoveredRowForActions = ref<number | null>(null)

const handleCellMouseEnter = (
  rowIndex: number,
  columnKey: string,
  columnIndex: number,
  event: MouseEvent
) => {
  extendSelectionDrag(rowIndex, columnKey, event)
  if (columnIndex === 0) {
    hoveredRowForActions.value = rowIndex
  }
}

const handleCellMouseLeave = (rowIndex: number, columnIndex: number) => {
  if (columnIndex === 0 && hoveredRowForActions.value === rowIndex) {
    hoveredRowForActions.value = null
  }
}

const stopSelectionDrag = () => {
  if (!selectionDrag.active) return
  selectionDrag.active = false
  selectionDrag.row = null
  selectionDrag.startCol = null
  document.removeEventListener('mouseup', stopSelectionDrag)
  document.removeEventListener('mousemove', onSelectionDragMove)
  stopSelectionAutoScroll()
}

const updateSelectionDrag = (columnKey: string) => {
  if (!selectionDrag.active || selectionDrag.row === null) return
  const startCol = selectionDrag.startCol
  if (!startCol) return
  const startIndex = getColumnIndex(startCol)
  const currentIndex = getColumnIndex(columnKey)
  if (startIndex === -1 || currentIndex === -1) return

  const [from, to] = startIndex <= currentIndex ? [startIndex, currentIndex] : [currentIndex, startIndex]
  const keys = props.columns.slice(from, to + 1).map((column) => column.key)
  selectedRange.value = { row: selectionDrag.row, columns: sortColumnsByIndex(keys) }
  selectionAnchor.value = { row: selectionDrag.row, col: startCol }
}

const handleSelectionAutoScroll = (event: MouseEvent) => {
  const wrapper = tableWrapper.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  if (event.clientX > rect.right - SELECTION_SCROLL_EDGE_THRESHOLD) {
    startSelectionAutoScroll(1)
  } else if (event.clientX < rect.left + SELECTION_SCROLL_EDGE_THRESHOLD) {
    startSelectionAutoScroll(-1)
  } else {
    stopSelectionAutoScroll()
  }
}

const startSelectionAutoScroll = (direction: -1 | 1) => {
  if (selectionAutoScrollDirection === direction && selectionAutoScrollFrame !== null) return
  stopSelectionAutoScroll()
  selectionAutoScrollDirection = direction
  const step = () => {
    if (!selectionDrag.active || !tableWrapper.value) {
      stopSelectionAutoScroll()
      return
    }
    const wrapper = tableWrapper.value
    const previous = wrapper.scrollLeft
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth
    if (direction === 1) {
      wrapper.scrollLeft = Math.min(maxScroll, previous + SELECTION_SCROLL_STEP)
    } else {
      wrapper.scrollLeft = Math.max(0, previous - SELECTION_SCROLL_STEP)
    }
    if (wrapper.scrollLeft === previous) {
      stopSelectionAutoScroll()
      return
    }
    if (lastPointerPosition) {
      updateSelectionFromPoint(lastPointerPosition.x, lastPointerPosition.y)
    }
    selectionAutoScrollFrame = window.requestAnimationFrame(step)
  }
  selectionAutoScrollFrame = window.requestAnimationFrame(step)
}

const stopSelectionAutoScroll = () => {
  if (selectionAutoScrollFrame !== null) {
    cancelAnimationFrame(selectionAutoScrollFrame)
    selectionAutoScrollFrame = null
  }
  selectionAutoScrollDirection = 0
}

const updateSelectionFromPoint = (x: number, y: number) => {
  if (!selectionDrag.active || selectionDrag.row === null) return
  const element = document.elementFromPoint(x, y) as HTMLElement | null
  const cell = element?.closest('td[data-row][data-col]') as HTMLElement | null
  if (!cell) return
  const rowAttr = cell.getAttribute('data-row')
  const colAttr = cell.getAttribute('data-col')
  if (rowAttr && colAttr && Number(rowAttr) === selectionDrag.row) {
    updateSelectionDrag(colAttr)
  }
}

const onSelectionDragMove = (event: MouseEvent) => {
  if (!selectionDrag.active) return
  if (event.buttons === 0) {
    stopSelectionDrag()
    return
  }
  lastPointerPosition = { x: event.clientX, y: event.clientY }
  handleSelectionAutoScroll(event)
  updateSelectionFromPoint(event.clientX, event.clientY)
  event.preventDefault()
}

const isEditableColumn = (columnKey: string) => {
  const column = props.columns.find((col) => col.key === columnKey)
  return column ? column.editable !== false : true
}

const startDragFill = (row: number, col: string) => {
  if (!isEditableColumn(col)) return
  const columns = getColumnsForOperation(row, col).filter((columnKey) =>
    isEditableColumn(columnKey)
  )
  if (!columns.length) return
  dragState.active = true
  dragState.startRow = row
  dragState.endRow = row
  dragState.cols = sortColumnsByIndex(columns)
  document.addEventListener('mousemove', onDragFill)
  document.addEventListener('mouseup', endDragFill)
}

const onDragFill = (event: MouseEvent) => {
  const cell = (event.target as HTMLElement).closest('td')
  if (!cell) return
  const rowAttr = cell.getAttribute('data-row')
  const colAttr = cell.getAttribute('data-col')
  if (colAttr && dragState.cols.includes(colAttr) && rowAttr) {
    dragState.endRow = Number(rowAttr)
  }
}

const endDragFill = () => {
  document.removeEventListener('mousemove', onDragFill)
  document.removeEventListener('mouseup', endDragFill)
  if (
    dragState.active &&
    dragState.startRow !== null &&
    dragState.endRow !== null &&
    dragState.cols.length
  ) {
    const start = dragState.startRow
    const end = dragState.endRow
    const [from, to] = start < end ? [start, end] : [end, start]
    for (let index = from; index <= to; index++) {
      if (index === start) continue
      dragState.cols.forEach((columnKey) => {
        if (isEditableColumn(columnKey)) {
          props.cloneCellValue(start, index, columnKey)
        }
      })
    }
  }
  dragState.active = false
  dragState.startRow = dragState.endRow = null
  dragState.cols = []
}

const isInDragRange = (row: number, col: string) => {
  if (
    !dragState.active ||
    !dragState.cols.includes(col) ||
    dragState.startRow === null ||
    dragState.endRow === null
  )
    return false
  const [from, to] =
    dragState.startRow < dragState.endRow
      ? [dragState.startRow, dragState.endRow]
      : [dragState.endRow, dragState.startRow]
  return row >= from && row <= to
}

const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement
  if (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.isContentEditable
  )
    return

  if (event.ctrlKey || event.metaKey) {
    const key = event.key.toLowerCase()
    if (key === 'z') {
      undo()
      event.preventDefault()
      return
    }
    if (key === 'x') {
      redo()
      event.preventDefault()
      return
    }
  }

  const { row, col } = selectedCell.value
  if (row === null || col === null) return
  if (!rows.value[row]) return

  if (
    (event.ctrlKey || event.metaKey) &&
    (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
  ) {
    if (props.onCtrlArrow) {
      const direction = event.key === 'ArrowLeft' ? 'left' : 'right'
      const handled = props.onCtrlArrow(row, col, direction)
      if (handled) {
        event.preventDefault()
        return
      }
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
    if (isEditableColumn(col)) {
      const value = props.getCellValue(row, col)
      clipboard.value = {
        column: col,
        columnType: getColumnType(col),
        value: JSON.parse(JSON.stringify(value ?? null)),
      }
      Toast.success(t('products.products.alert.toast.copied'))
    }
    event.preventDefault()
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
    if (clipboard.value) {
      const columns = getColumnsForOperation(row, col).filter((columnKey) =>
        isEditableColumn(columnKey)
      )
      if (!columns.length) {
        event.preventDefault()
        return
      }
      const invalidColumn = columns.find((columnKey) =>
        !canPasteToColumn(clipboard.value!, columnKey)
      )
      if (invalidColumn) {
        Toast.error(t('products.products.alert.toast.pasteIncompatibleColumn'))
      } else {
        columns.forEach((columnKey) => {
          if (clipboard.value?.value === null) {
            props.clearCellValue(row, columnKey)
            return
          }
          const transformed = transformClipboardValue(
            clipboard.value?.value,
            clipboard.value?.columnType,
            getColumnType(columnKey)
          )
          if (transformed === null) {
            props.clearCellValue(row, columnKey)
          } else if (transformed !== undefined) {
            props.setCellValue(row, columnKey, JSON.parse(JSON.stringify(transformed)))
          }
        })
        Toast.success(t('products.products.alert.toast.pasted'))
      }
    }
    event.preventDefault()
  } else if (
    (event.key === 'Delete' || event.key === 'Backspace') &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    const columns = getColumnsForOperation(row, col).filter((columnKey) =>
      isEditableColumn(columnKey)
    )
    if (columns.length) {
      columns.forEach((columnKey) => props.clearCellValue(row, columnKey))
    }
    event.preventDefault()
  } else if (!event.ctrlKey && !event.metaKey) {
    switch (event.key) {
      case 'ArrowUp':
        if (row > 0) {
          const nextRow = row - 1
          selectedCell.value.row = nextRow
          if (selectedCell.value.col) {
            const key = selectedCell.value.col
            selectedRange.value = { row: nextRow, columns: [key] }
            selectionAnchor.value = { row: nextRow, col: key }
          }
        }
        event.preventDefault()
        break
      case 'ArrowDown':
        if (row < rows.value.length - 1) {
          const nextRow = row + 1
          selectedCell.value.row = nextRow
          if (selectedCell.value.col) {
            const key = selectedCell.value.col
            selectedRange.value = { row: nextRow, columns: [key] }
            selectionAnchor.value = { row: nextRow, col: key }
          }
        }
        event.preventDefault()
        break
      case 'ArrowLeft': {
        const colIndex = props.columns.findIndex((column) => column.key === col)
        if (colIndex > 0) {
          const key = props.columns[colIndex - 1].key
          selectedCell.value.col = key
          selectedRange.value = { row, columns: [key] }
          selectionAnchor.value = { row, col: key }
        }
        event.preventDefault()
        break
      }
      case 'ArrowRight': {
        const colIndex = props.columns.findIndex((column) => column.key === col)
        if (colIndex < props.columns.length - 1) {
          const key = props.columns[colIndex + 1].key
          selectedCell.value.col = key
          selectedRange.value = { row, columns: [key] }
          selectionAnchor.value = { row, col: key }
        }
        event.preventDefault()
        break
      }
    }
  }
}

const canPasteToColumn = (clipboardValue: ClipboardValue, targetColumn: string) => {
  if (!isEditableColumn(targetColumn)) return false
  if (clipboardValue.column === targetColumn) return true
  const fromType = clipboardValue.columnType
  const toType = getColumnType(targetColumn)
  return canPasteBetweenTypes(fromType, toType)
}

const canPasteBetweenTypes = (
  fromType?: string,
  toType?: string
) => {
  if (!fromType && !toType) return true
  if (!fromType || !toType) return false
  const from = fromType.toUpperCase()
  const to = toType.toUpperCase()
  if (from === to) return true
  if (from === PropertyTypes.SELECT || from === PropertyTypes.MULTISELECT) return false
  if (to === PropertyTypes.SELECT || to === PropertyTypes.MULTISELECT) return false
  if (from === PropertyTypes.INT && to === PropertyTypes.FLOAT) return true
  if (from === PropertyTypes.TEXT && to === PropertyTypes.DESCRIPTION) return true
  if (from === PropertyTypes.DATE && to === PropertyTypes.DATETIME) return true
  if (from === PropertyTypes.DATETIME && to === PropertyTypes.DATE) return true
  return false
}

const transformClipboardValue = (
  value: any,
  fromType?: string,
  toType?: string
) => {
  if (!fromType && !toType) return value
  if (!fromType || !toType) return undefined
  const from = fromType.toUpperCase()
  const to = toType.toUpperCase()

  if (from === to) return value

  if (from === PropertyTypes.INT && to === PropertyTypes.FLOAT) {
    const intValue = value?.valueInt
    if (intValue === undefined || intValue === null || intValue === '') return null
    return { valueFloat: Number(intValue) }
  }

  if (from === PropertyTypes.TEXT && to === PropertyTypes.DESCRIPTION) {
    const translation = value?.translation
    if (!translation || !('valueText' in translation)) return undefined
    const nextTranslation: Record<string, any> = { ...translation }
    nextTranslation.valueDescription = translation.valueText ?? ''
    delete nextTranslation.valueText
    return { translation: nextTranslation }
  }

  if (from === PropertyTypes.DATE && to === PropertyTypes.DATETIME) {
    const dateValue = value?.valueDate
    if (!dateValue) return null
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) {
      return { valueDatetime: dateValue }
    }
    return { valueDatetime: date }
  }

  if (from === PropertyTypes.DATETIME && to === PropertyTypes.DATE) {
    const datetimeValue = value?.valueDatetime
    if (!datetimeValue) return null
    const date = new Date(datetimeValue)
    if (Number.isNaN(date.getTime())) return undefined
    const normalized = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
    return { valueDate: normalized }
  }

  return undefined
}

const copyRow = (rowIndex: number) => {
  const values: Record<string, ClipboardValue> = {}
  props.columns.forEach((column) => {
    if (!isEditableColumn(column.key)) return
    const value = props.getCellValue(rowIndex, column.key)
    values[column.key] = {
      column: column.key,
      columnType: getColumnType(column.key),
      value: JSON.parse(JSON.stringify(value ?? null)),
    }
  })

  if (!Object.keys(values).length) {
    rowClipboard.value = null
    Toast.error(t('products.products.alert.toast.rowCopyNoEditableColumns'))
    return
  }

  rowClipboard.value = { values }
  Toast.success(t('products.products.alert.toast.rowCopied'))
}

const pasteRow = (rowIndex: number) => {
  if (!rowClipboard.value) {
    Toast.error(t('products.products.alert.toast.rowClipboardEmpty'))
    return
  }

  const entries = Object.entries(rowClipboard.value.values).filter(([columnKey]) => {
    if (!isEditableColumn(columnKey)) return false
    return props.columns.some((column) => column.key === columnKey)
  })

  if (!entries.length) {
    Toast.error(t('products.products.alert.toast.rowPasteNoEditableColumns'))
    return
  }

  const invalidColumn = entries.find(([columnKey, clipboardValue]) =>
    !canPasteToColumn(clipboardValue, columnKey)
  )

  if (invalidColumn) {
    Toast.error(t('products.products.alert.toast.pasteIncompatibleColumn'))
    return
  }

  entries.forEach(([columnKey, clipboardValue]) => {
    if (clipboardValue.value === null) {
      props.clearCellValue(rowIndex, columnKey)
      return
    }

    const transformed = transformClipboardValue(
      clipboardValue.value,
      clipboardValue.columnType,
      getColumnType(columnKey)
    )

    if (transformed === null) {
      props.clearCellValue(rowIndex, columnKey)
    } else if (transformed !== undefined) {
      props.setCellValue(rowIndex, columnKey, JSON.parse(JSON.stringify(transformed)))
    }
  })

  Toast.success(t('products.products.alert.toast.rowPasted'))
}

watch(
  selectedCell,
  () => {
    nextTick(() => {
      if (selectedCell.value.row !== null && selectedCell.value.col) {
        const cell = tableWrapper.value?.querySelector(
          `td[data-row="${selectedCell.value.row}"][data-col="${selectedCell.value.col}"]`
        ) as HTMLElement | null
        cell?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    })
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', onDragFill)
  document.removeEventListener('mouseup', endDragFill)
  document.removeEventListener('mouseup', stopSelectionDrag)
  document.removeEventListener('mousemove', onSelectionDragMove)
  stopSelectionAutoScroll()
})

const MIN_COLUMN_WIDTH = 100
const startResize = (event: MouseEvent, key: string) => {
  const startX = event.pageX
  const startWidth = columnWidths[key]

  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.pageX - startX
    columnWidths[key] = Math.max(MIN_COLUMN_WIDTH, startWidth + delta)
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const undo = () => {
  if (!history.value.length) return
  skipHistory.value = true
  redoStack.value.push(JSON.parse(JSON.stringify(rows.value)))
  const previous = history.value.pop()
  emit('update:rows', JSON.parse(JSON.stringify(previous)))
  nextTick(() => {
    skipHistory.value = false
  })
  Toast.info(t('products.products.alert.toast.undo'))
}

const redo = () => {
  if (!redoStack.value.length) return
  skipHistory.value = true
  history.value.push(JSON.parse(JSON.stringify(rows.value)))
  const nextValue = redoStack.value.pop()
  emit('update:rows', JSON.parse(JSON.stringify(nextValue)))
  nextTick(() => {
    skipHistory.value = false
  })
  Toast.info(t('products.products.alert.toast.redo'))
}

const resetHistory = (value?: any[]) => {
  history.value = []
  redoStack.value = []
  lastSnapshot.value = JSON.stringify(toRaw(value ?? rows.value))
}

const getHeaderIconClass = (column: MatrixColumn) => column.iconColorClass || 'text-gray-400'

defineExpose<MatrixEditorExpose>({ resetHistory })
</script>

<template>
  <div class="relative w-full min-w-0">
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75"
    >
      <LocalLoader :loading="loading" />
    </div>
    <Flex between middle gap="2" class="mb-4">
      <FlexCell grow>
        <slot name="filters" />
      </FlexCell>
      <FlexCell class="flex">
        <Button class="btn btn-secondary" :disabled="!canUndo" @click="undo">
          <Icon name="arrow-left" />
        </Button>
        <Button class="btn btn-secondary ml-2" :disabled="!canRedo" @click="redo">
          <Icon name="arrow-right" />
        </Button>
      </FlexCell>
      <FlexCell>
        <slot name="toolbar-right" />
      </FlexCell>
      <FlexCell>
        <Button class="btn btn-primary" :disabled="!hasChanges" @click="$emit('save')">
          {{ t('shared.button.save') }}
        </Button>
      </FlexCell>
    </Flex>
    <div ref="tableWrapper" class="overflow-x-auto w-full max-w-full">
      <table v-if="rows.length" class="min-w-max border border-gray-300 border-collapse select-none">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              class="px-2 py-1 text-sm font-medium text-gray-700 relative border-r border-gray-200"
              :class="[
                column.key === 'active' ? 'text-center' : 'text-left',
                column.sticky ? 'sticky z-10 bg-gray-100' : '',
              ]"
              :style="[
                { width: (columnWidths[column.key] ?? getDefaultColumnWidth(column)) + 'px' },
                column.sticky ? { left: stickyOffsets[column.key] + 'px' } : {},
              ]"
            >
              <div class="flex items-center h-full">
                <Icon
                  v-if="column.requireType"
                  name="circle-dot"
                  :class="[getHeaderIconClass(column), 'mr-1']"
                />
                <span class="block truncate" :title="column.label"><strong>{{ column.label }}</strong></span>
                <div
                  class="resizer-wrapper select-none"
                  @mousedown="(event) => startResize(event, column.key)"
                >
                  <span class="resizer" />
                  <button
                    v-if="hasInsertAction(columnIndex)"
                    type="button"
                    class="insert-column-button"
                    @mousedown.stop
                    @click.stop.prevent="handleInsertClick(columnIndex)"
                  >
                    <Icon name="plus" class="w-3 h-3 text-gray-600" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="row?.[rowKey] ?? rowIndex" class="border-t">
            <td
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              class="px-4 py-1 border-r border-gray-200 relative cursor-pointer"
              :class="[
                {
                  'bg-blue-100': isInDragRange(rowIndex, column.key),
                  'bg-blue-50':
                    isCellSelected(rowIndex, column.key) && !isInDragRange(rowIndex, column.key),
                },
                column.key === 'active' ? 'text-center px-2' : '',
                column.sticky ? 'sticky z-10' : '',
                column.sticky &&
                !isCellSelected(rowIndex, column.key) &&
                !isInDragRange(rowIndex, column.key)
                  ? 'bg-white'
                  : '',
              ]"
              :style="[
                { width: (columnWidths[column.key] ?? getDefaultColumnWidth(column)) + 'px' },
                column.sticky ? { left: stickyOffsets[column.key] + 'px' } : {},
              ]"
              :data-row="rowIndex"
              :data-col="column.key"
              @mousedown="(event) => beginSelectionDrag(rowIndex, column.key, event)"
              @mouseenter="(event) => handleCellMouseEnter(rowIndex, column.key, columnIndex, event)"
              @mouseleave="() => handleCellMouseLeave(rowIndex, columnIndex)"
              @click="(event) => selectCell(rowIndex, column.key, event)"
            >
              <div
                v-if="columnIndex === 0"
                class="absolute left-0 top-1/2 flex -translate-x-full -translate-y-1/2 transform flex-col space-y-1"
                :class="[
                  hoveredRowForActions === rowIndex
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none',
                ]"
              >
                <Button
                  customClass="btn btn-secondary px-2 py-1 text-xs leading-none"
                  @click.stop.prevent="copyRow(rowIndex)"
                >
                  {{ t('products.products.matrix.rowActions.copy') }}
                </Button>
                <Button
                  :disabled="!hasRowClipboard"
                  customClass="btn btn-secondary px-2 py-1 text-xs leading-none"
                  @click.stop.prevent="pasteRow(rowIndex)"
                >
                  {{ t('products.products.matrix.rowActions.paste') }}
                </Button>
              </div>
              <div
                v-if="isActiveCell(rowIndex, column.key)"
                class="absolute inset-0 border-2 border-blue-500 pointer-events-none"
              />
              <div
                v-if="isDragHandleCell(rowIndex, column.key)"
                class="absolute w-2 h-2 bg-blue-500 bottom-0 right-0 pointer-events-auto cursor-row-resize"
                @mousedown.stop="startDragFill(rowIndex, column.key)"
              />
              <slot
                name="cell"
                :row="row"
                :column="column"
                :row-index="rowIndex"
                :is-selected="isCellSelected(rowIndex, column.key)"
              >
                <span class="block truncate">
                  {{ getValue(rowIndex, column.key) ?? '' }}
                </span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.resizer-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
}

.resizer {
  position: absolute;
  inset: 0;
  background-color: #e5e7eb;
  cursor: inherit;
}

.insert-column-button {
  position: absolute;
  top: 20px;
  right: -6px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d1d5db;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.resizer-wrapper:hover .insert-column-button,
.insert-column-button:focus {
  opacity: 1;
  pointer-events: auto;
}
</style>
