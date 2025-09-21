<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Flex, FlexCell } from '../../layouts/flex'
import { Button } from '../../atoms/button'
import { Icon } from '../../atoms/icon'
import { LocalLoader } from '../../atoms/local-loader'
import { Toast } from '../../../modules/toast'
import type { MatrixColumn, MatrixEditorExpose } from './types'

interface ClipboardValue {
  column: string
  value: any
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
const clipboard = ref<ClipboardValue | null>(null)
const dragState = reactive({
  active: false,
  startRow: null as number | null,
  endRow: null as number | null,
  col: '' as string,
})
const history = ref<any[]>([])
const redoStack = ref<any[]>([])
const skipHistory = ref(false)
const lastSnapshot = ref<string>(JSON.stringify(toRaw(props.rows ?? [])))

const columnWidths = reactive<Record<string, number>>({})
const rows = computed(() => props.rows ?? [])
const getValue = (rowIndex: number, columnKey: string) =>
  props.getCellValue(rowIndex, columnKey)

const getDefaultColumnWidth = (column: MatrixColumn) =>
  column.initialWidth != null ? column.initialWidth : column.key === 'active' ? 60 : 150

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

const selectCell = (rowIndex: number, columnKey: string) => {
  selectedCell.value = { row: rowIndex, col: columnKey }
}

const isEditableColumn = (columnKey: string) => {
  const column = props.columns.find((col) => col.key === columnKey)
  return column ? column.editable !== false : true
}

const startDragFill = (row: number, col: string) => {
  if (!isEditableColumn(col)) return
  dragState.active = true
  dragState.startRow = row
  dragState.endRow = row
  dragState.col = col
  document.addEventListener('mousemove', onDragFill)
  document.addEventListener('mouseup', endDragFill)
}

const onDragFill = (event: MouseEvent) => {
  const cell = (event.target as HTMLElement).closest('td')
  if (!cell) return
  const rowAttr = cell.getAttribute('data-row')
  const colAttr = cell.getAttribute('data-col')
  if (colAttr === dragState.col && rowAttr) {
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
    dragState.col
  ) {
    const start = dragState.startRow
    const end = dragState.endRow
    const [from, to] = start < end ? [start, end] : [end, start]
    for (let index = from; index <= to; index++) {
      if (index === start) continue
      props.cloneCellValue(start, index, dragState.col)
    }
  }
  dragState.active = false
  dragState.startRow = dragState.endRow = null
  dragState.col = ''
}

const isInDragRange = (row: number, col: string) => {
  if (
    !dragState.active ||
    dragState.col !== col ||
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

  if (event.ctrlKey) {
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

  if (event.ctrlKey && event.key.toLowerCase() === 'c') {
    if (isEditableColumn(col)) {
      const value = props.getCellValue(row, col)
      clipboard.value = {
        column: col,
        value: JSON.parse(JSON.stringify(value ?? null)),
      }
      Toast.success(t('products.products.alert.toast.copied'))
    }
    event.preventDefault()
  } else if (event.ctrlKey && event.key.toLowerCase() === 'v') {
    if (clipboard.value) {
      if (clipboard.value.column === col) {
        if (isEditableColumn(col)) {
          if (clipboard.value.value === null) {
            props.clearCellValue(row, col)
          } else {
            props.setCellValue(row, col, JSON.parse(JSON.stringify(clipboard.value.value)))
          }
          Toast.success(t('products.products.alert.toast.pasted'))
        }
      } else {
        Toast.error(t('products.products.alert.toast.pasteDifferentColumn'))
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
    if (isEditableColumn(col)) {
      props.clearCellValue(row, col)
    }
    event.preventDefault()
  } else if (!event.ctrlKey && !event.metaKey) {
    switch (event.key) {
      case 'ArrowUp':
        if (row > 0) selectedCell.value.row = row - 1
        event.preventDefault()
        break
      case 'ArrowDown':
        if (row < rows.value.length - 1) selectedCell.value.row = row + 1
        event.preventDefault()
        break
      case 'ArrowLeft': {
        const colIndex = props.columns.findIndex((column) => column.key === col)
        if (colIndex > 0) selectedCell.value.col = props.columns[colIndex - 1].key
        event.preventDefault()
        break
      }
      case 'ArrowRight': {
        const colIndex = props.columns.findIndex((column) => column.key === col)
        if (colIndex < props.columns.length - 1)
          selectedCell.value.col = props.columns[colIndex + 1].key
        event.preventDefault()
        break
      }
    }
  }
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
              v-for="column in columns"
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
                <span class="resizer select-none" @mousedown="(event) => startResize(event, column.key)" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="row?.[rowKey] ?? rowIndex" class="border-t">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-1 border-r border-gray-200 relative cursor-pointer"
              :class="[
                { 'bg-blue-100': isInDragRange(rowIndex, column.key) },
                column.key === 'active' ? 'text-center px-2' : '',
                column.sticky ? 'sticky z-10 bg-white' : '',
              ]"
              :style="[
                { width: (columnWidths[column.key] ?? getDefaultColumnWidth(column)) + 'px' },
                column.sticky ? { left: stickyOffsets[column.key] + 'px' } : {},
              ]"
              :data-row="rowIndex"
              :data-col="column.key"
              @click="selectCell(rowIndex, column.key)"
            >
              <div
                v-if="selectedCell.row === rowIndex && selectedCell.col === column.key"
                class="absolute inset-0 border-2 border-blue-500 pointer-events-none"
              >
                <div
                  v-if="isEditableColumn(column.key)"
                  class="absolute w-2 h-2 bg-blue-500 bottom-0 right-0 pointer-events-auto cursor-row-resize"
                  @mousedown.stop="startDragFill(rowIndex, column.key)"
                />
              </div>
              <slot
                name="cell"
                :row="row"
                :column="column"
                :row-index="rowIndex"
                :is-selected="selectedCell.row === rowIndex && selectedCell.col === column.key"
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
.resizer {
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background-color: #e5e7eb;
}
</style>
