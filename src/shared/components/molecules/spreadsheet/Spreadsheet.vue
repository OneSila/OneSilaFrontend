<script setup lang="ts">
import { ref, Ref, computed, onMounted, onBeforeUnmount } from 'vue';

import { Toast } from '../../../modules/toast';

import { Label } from '../../atoms/label';

import { Cell } from './Cell';

import SpreadsheetCell from './SpreadsheetCell.vue';

const props = defineProps<{
  columns: any[];
  rows: any[];
  rowIds: string[];
  loadingCells?: Cell[];
  verticalRange?: boolean;
  horizontalRange?: boolean;
  range?: boolean;
}>();

const emit = defineEmits<{
  (e: 'cell-edited', data: { cell: Cell; value: any }): void;
  (e: 'pasted', data: { cells: Cell[]; value: any }): void;
  (e: 'cells-pasted', data: { cells: Cell[]; values: [Cell, string[]] }): void;
  (e: 'cells-deleted', highlightedCells: Cell[]): void;
  (e: 'create-attribute-clicked', columnId: string, rowIndex: number): void;
  (
    e: 'range-selected',
    data: { highlightedCells: Cell[]; dragFromCell: Cell },
  ): void;
}>();

const highlightedCells: Ref<Map<string, Cell>> = ref(new Map());
const lastHighlightedCell: Ref<Cell | null> = ref(null);
const dragFromCell: Ref<Cell | null> = ref(null);

const canvas = document.createElement('canvas');

const lastDragOverCell: Ref<{
  element: Element;
  row: number;
  column: number;
} | null> = ref(null);

const dragAxis = computed(() => {
  if (!dragFromCell.value || !lastDragOverCell.value) {
    return null;
  }

  return getDragAxis(dragFromCell.value, lastDragOverCell.value);
});

const isMultipleVerticalCellsSelected = computed(() => {
  if (highlightedCells.value.size === 0) {
    return false;
  }

  const rows = new Set(
    [...highlightedCells.value.values()].map((cell) => cell.row),
  );

  return rows.size > 1;
});

const dragDirection = computed(() => {
  if (!dragFromCell.value || !lastDragOverCell.value) {
    return null;
  }

  return getDragDirection(dragFromCell.value, lastDragOverCell.value);
});

const getDragAxis = (cellFrom: Cell, cellTo: Cell) => {
  if (Math.abs(cellFrom.row - cellTo.row) > 0) {
    return 'y';
  }

  if (Math.abs(cellFrom.column - cellTo.column) > 0) {
    return 'x';
  }

  return null;
};

const draggedOverCells = computed(() => {
  if (!lastDragOverCell.value || !dragFromCell.value) {
    return {};
  }

  const draggedOverCellsDictionary = {};

  const highlightedColumns = new Set(
    [...highlightedCells.value.values()].map((cell) => cell.column),
  );

  highlightedColumns.forEach((column) => {
    if (!lastDragOverCell.value || !dragFromCell.value) {
      return;
    }

    if (lastDragOverCell.value.row > dragFromCell.value.row) {
      for (
        let i = dragFromCell.value.row + 1;
        i <= lastDragOverCell.value.row;
        i++
      ) {
        draggedOverCellsDictionary[generateKey(i, column)] = true;
      }
    } else if (lastDragOverCell.value.row < dragFromCell.value.row) {
      for (
        let i = dragFromCell.value.row - 1;
        i >= lastDragOverCell.value.row;
        i--
      ) {
        draggedOverCellsDictionary[generateKey(i, column)] = true;
      }
    }
  });

  return draggedOverCellsDictionary;
});

const getDragDirection = (cellFrom: Cell, cellTo: Cell) => {
  const axis = getDragAxis(cellFrom, cellTo);

  if (
    (axis === 'y' && cellTo.row > cellFrom.row) ||
    (axis === 'x' && cellTo.column > cellFrom.column)
  ) {
    return 'forward';
  }

  if (
    (axis === 'y' && cellFrom.row > cellTo.row) ||
    (axis === 'x' && cellFrom.column > cellTo.column)
  ) {
    return 'backward';
  }

  return null;
};

const generateKey = (rowIndex: number, columnIndex: number) => {
  return `row-${rowIndex}_column-${columnIndex}`;
};

const highlightCell = (
  rowIndex: number,
  columnIndex: number,
  limitAxis = false,
) => {
  highlightedCells.value.set(generateKey(rowIndex, columnIndex), {
    row: rowIndex,
    column: columnIndex,
  });

  if (limitAxis && highlightedCells.value.size > 1) {
    const rows = new Set(
      [...highlightedCells.value.values()].map((cell) => cell.row),
    );
    const columns = new Set(
      [...highlightedCells.value.values()].map((cell) => cell.column),
    );

    if (rows.size > 1 && columns.size > 1) {
      return highlightedCells.value.delete(generateKey(rowIndex, columnIndex));
    }

    if (
      lastHighlightedCell.value?.column === columnIndex &&
      !rows.has(rowIndex - 1) &&
      !rows.has(rowIndex + 1)
    ) {
      return highlightedCells.value.delete(generateKey(rowIndex, columnIndex));
    }

    if (
      lastHighlightedCell.value?.row === rowIndex &&
      !columns.has(columnIndex - 1) &&
      !columns.has(columnIndex + 1)
    ) {
      return highlightedCells.value.delete(generateKey(rowIndex, columnIndex));
    }
  }

  lastHighlightedCell.value = {
    row: rowIndex,
    column: columnIndex,
  };
};

const isHighlightedCell = (rowIndex: number, columnIndex: number) => {
  return highlightedCells.value.has(generateKey(rowIndex, columnIndex));
};

const isDraggedOverCell = (rowIndex: number, columnIndex: number) => {
  return draggedOverCells.value[generateKey(rowIndex, columnIndex)];
};

const isLastHighlightedCell = (row: number, column: number) => {
  return (
    lastHighlightedCell.value?.row === row &&
    lastHighlightedCell.value?.column === column
  );
};

const isLoading = (row: number, column: number) => {
  return !!props.loadingCells?.find(
    (cell) => cell.row === row && cell.column === column,
  );
};

const containsReadOnlyColumn = (rowIndex: number) => {
  const readOnlyColumnIndexes: number[] = [];

  props.columns.forEach((column, index) => {
    if (column.readonly) {
      readOnlyColumnIndexes.push(index);
    }
  });

  return !!readOnlyColumnIndexes.find((columnIndex) => {
    return highlightedCells.value.has(generateKey(rowIndex, columnIndex));
  });
};

const onToggleCellHighlight = (
  event: MouseEvent,
  rowIndex: number,
  columnIndex: number,
) => {
  const cell = { row: rowIndex, column: columnIndex };

  if (event.shiftKey) {
    let smallestIndex = 0;
    let biggestIndex = 0;

    const lastColumnIndex = lastHighlightedCell.value?.column || 0;
    const lastRowIndex = lastHighlightedCell.value?.row || 0;

    if (cell.row === lastHighlightedCell.value?.row) {
      if (
        highlightedCells.value.size > 0 &&
        [...highlightedCells.value.values()][0].row !== cell.row
      ) {
        highlightedCells.value.clear();
        highlightCell(cell.row, cell.column);
      } else {
        smallestIndex =
          cell.column < lastColumnIndex ? cell.column : lastColumnIndex;

        biggestIndex =
          cell.column > lastColumnIndex ? cell.column : lastColumnIndex;

        for (let i = smallestIndex; i <= biggestIndex; i++) {
          highlightCell(cell.row, i);
        }
      }
    } else if (cell.column === lastHighlightedCell.value?.column) {
      if (
        highlightedCells.value.size > 0 &&
        [...highlightedCells.value.values()][0].column !== cell.column
      ) {
        highlightedCells.value.clear();
        highlightCell(cell.row, cell.column);
      } else {
        smallestIndex = cell.row < lastRowIndex ? cell.row : lastRowIndex;

        biggestIndex = cell.row > lastRowIndex ? cell.row : lastRowIndex;

        for (let i = smallestIndex; i <= biggestIndex; i++) {
          highlightCell(i, cell.column);
        }
      }
    }

    return;
  }

  // console.log(props.rows, props.columns);

  if (event.metaKey) {
    return highlightCell(cell.row, cell.column, true);
  }

  highlightedCells.value.clear();
  highlightCell(cell.row, cell.column);
};

const onDragStart = (
  event: DragEvent,
  rowIndex: number,
  columnIndex: number,
) => {
  if (event.dataTransfer) {
    event.dataTransfer.setDragImage(canvas, 0, 0);
  }

  dragFromCell.value = { row: rowIndex, column: columnIndex };

  lastDragOverCell.value = {
    element: event.target as Element,
    row: rowIndex,
    column: columnIndex,
  };
};

const onDragEnd = () => {
  if (!dragFromCell.value || !lastDragOverCell.value) {
    return;
  }

  if (dragAxis.value === 'y' && dragDirection.value) {
    const columnsToHighlight = [...highlightedCells.value.values()].map(
      (cell) => cell.column,
    );

    columnsToHighlight.forEach((column) => {
      if (!dragFromCell.value || !lastDragOverCell.value) {
        return;
      }

      if (dragDirection.value === 'forward') {
        for (
          let i = dragFromCell.value.row + 1;
          i <= lastDragOverCell.value.row;
          i++
        ) {
          highlightCell(i, column);
        }
      } else if (dragDirection.value === 'backward') {
        for (
          let i = lastDragOverCell.value.row;
          i < dragFromCell.value.row;
          i++
        ) {
          highlightCell(i, column);
        }
      }
    });
  }

  if (dragAxis.value === 'x' && dragDirection.value) {
    const rowsToHighlight = [...highlightedCells.value.values()].map(
      (cell) => cell.row,
    );

    rowsToHighlight.forEach((row) => {
      if (!dragFromCell.value || !lastDragOverCell.value) {
        return;
      }

      if (dragDirection.value === 'forward') {
        for (
          let i = dragFromCell.value.column + 1;
          i <= lastDragOverCell.value.column;
          i++
        ) {
          highlightCell(row, i);
        }
      } else if (dragDirection.value === 'backward') {
        for (
          let i = lastDragOverCell.value.column;
          i < dragFromCell.value.column;
          i++
        ) {
          highlightCell(row, i);
        }
      }
    });
  }

  emit('range-selected', {
    highlightedCells: [...highlightedCells.value.values()],
    dragFromCell: dragFromCell.value,
  });

  dragFromCell.value = null;
  lastDragOverCell.value = null;
};

const onDragEntered = (
  event: DragEvent,
  rowIndex: number,
  columnIndex: number,
) => {
  if (!dragFromCell.value) {
    return;
  }

  const element = event.target as Element;

  if (!element.classList || !element.classList.contains('spreadsheet-cell')) {
    return;
  }

  const axisNow = getDragAxis(dragFromCell.value, {
    row: rowIndex,
    column: columnIndex,
  });

  if (
    (axisNow === 'x' && props.verticalRange) ||
    (axisNow === 'y' && props.horizontalRange)
  ) {
    return;
  }

  if (lastDragOverCell.value) {
    if (
      (dragAxis.value === 'y' &&
        columnIndex !== lastDragOverCell.value.column) ||
      (dragAxis.value === 'x' && rowIndex !== lastDragOverCell.value.row)
    ) {
      return;
    }
  }

  lastDragOverCell.value = { element, row: rowIndex, column: columnIndex };
};

const onMultipleDeleted = () => {
  if (!confirm('Are you sure you want to delete from all highlighted cells?')) {
    return;
  }

  emit('cells-deleted', [...highlightedCells.value.values()]);
};

const onCopyPressed = () => {
  if (highlightedCells.value.size < 1) {
    return;
  }

  if (
    new Set([...highlightedCells.value.values()].map((cell) => cell.row)).size >
    1
  ) {
    return Toast.error('You cannot copy from multiple rows.');
  }

  const valuesToSave: any[] = [];

  if (highlightedCells.value.size > 0) {
    [...highlightedCells.value.values()].forEach((value: Cell) => {
      valuesToSave.push([value, props.rows[value.row][value.column]]);
    });
  }

  return navigator.clipboard.writeText(JSON.stringify(valuesToSave));
};

const columnForResizing: Ref<any> = ref(null);

const onColumnDragStarted = (event: DragEvent, column) => {
  // if (event.dataTransfer) {
  //   event.dataTransfer.setDragImage(canvas, 0, 0);
  // }
  // console.log((event.target as any).parentElement?.parentElement?.offsetWidth);

  columnForResizing.value = {
    column,
    width:
      column.width ||
      column.minWidth ||
      (event.target as any).parentElement?.parentElement?.offsetWidth ||
      0,
    newWidth: 0,
    x: event.x,
  };
  // console.log(event, column);
  // console.log('start', event.x, column);
};

const onColumnDragEnded = () => {
  // console.log(event, column);
  // console.log('end', event.x, column);
  if (columnForResizing.value?.newWidth) {
    columnForResizing.value.column.width = columnForResizing.value.newWidth;
  }

  columnForResizing.value = null;
};

const onDraggedOver = (event: DragEvent) => {
  if (!columnForResizing.value) {
    return;
  }

  const widthChange = event.x - columnForResizing.value.x;
  const minWidth = columnForResizing.value.column.minWidth || 0;
  const width = columnForResizing.value.width;

  let newWidth = width + widthChange;

  if (newWidth < minWidth) {
    newWidth = minWidth;
  }

  columnForResizing.value.newWidth = newWidth;

  // columnForResizing.value.column.width = newWidth;

  // console.log('drag', { widthChange, newWidth, minWidth, width });
};

onMounted(() => {
  document.body.appendChild(canvas);
});

onBeforeUnmount(() => {
  canvas.remove();
});
</script>

<template>
  <div
    class="spreadsheet overflow-auto"
    :class="{
      'cursor-move': dragFromCell,
    }"
  >
    <table class="table table-auto border-collapse" style="height: 1px">
      <thead @dragover="onDraggedOver">
        <th
          v-for="column in columns"
          :key="column"
          class="h-full border border-gray-300 p-0 text-left"
        >
          <Grid
            class="flex h-full items-center justify-between pl-1"
            :style="{
              'grid-template-columns': '1fr 0.5rem !important',
              // width: `${
              //   column.width && column.width > (column.minWidth || 0)
              //     ? column.width
              //     : column.minWidth
              // }px`,
              width: column.width && `${column.width}px`,
            }"
          >
            <GridCell class="overflow-hidden overflow-ellipsis">
              <Label no-wrap>{{ column.label }}</Label>
            </GridCell>

            <GridCell class="h-full">
              <div
                class="h-full cursor-move hover:bg-blue-400"
                style="width: 100%"
                :draggable="true"
                @dragstart="(event) => onColumnDragStarted(event, column)"
                @dragend="onColumnDragEnded()"
              />
            </GridCell>
          </Grid>
        </th>
      </thead>

      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="`row-${rowIndex + 1}`">
          <td
            v-for="(cell, columnIndex) in row"
            :key="generateKey(rowIndex, columnIndex)"
            class="h-full select-none border border-gray-300 p-0"
          >
            <SpreadsheetCell
              :class="{
                'overflow-hidden overflow-ellipsis': columns[columnIndex].width,
                'w-full': !columns[columnIndex].width,
              }"
              :style="{
                width:
                  columns[columnIndex].width &&
                  `${columns[columnIndex].width}px`,
                'min-width': columns[columnIndex].minWidth
                  ? `${columns[columnIndex].minWidth}px`
                  : undefined,
              }"
              :cell="cell"
              :column="columns[columnIndex]"
              :row-id="rowIds[rowIndex]"
              :custom-classes="columns[columnIndex].customClasses"
              :last-highlighted="isLastHighlightedCell(rowIndex, columnIndex)"
              :multiple-highlighted="highlightedCells.size > 1"
              :drag-disabled="
                containsReadOnlyColumn(rowIndex) ||
                isMultipleVerticalCellsSelected
              "
              :highlighted="isHighlightedCell(rowIndex, columnIndex)"
              :dragged-over="isDraggedOverCell(rowIndex, columnIndex)"
              :has-highlighted-top="
                isHighlightedCell(rowIndex - 1, columnIndex)
              "
              :has-highlighted-bottom="
                isHighlightedCell(rowIndex + 1, columnIndex)
              "
              :has-highlighted-right="
                isHighlightedCell(rowIndex, columnIndex + 1)
              "
              :has-highlighted-left="
                isHighlightedCell(rowIndex, columnIndex - 1)
              "
              :has-dragged-left="isDraggedOverCell(rowIndex, columnIndex - 1)"
              :has-dragged-right="isDraggedOverCell(rowIndex, columnIndex + 1)"
              :has-dragged-top="isDraggedOverCell(rowIndex - 1, columnIndex)"
              :has-dragged-bottom="isDraggedOverCell(rowIndex + 1, columnIndex)"
              :range="range || verticalRange || horizontalRange"
              :clickable="columns[columnIndex].clickable"
              :read-only="columns[columnIndex].readonly"
              :is-sku-column="columnIndex === 0"
              :loading="isLoading(rowIndex, columnIndex)"
              @click="
                (event) => onToggleCellHighlight(event, rowIndex, columnIndex)
              "
              @dragenter="
                (event) => onDragEntered(event, rowIndex, columnIndex)
              "
              @dragstart="(event) => onDragStart(event, rowIndex, columnIndex)"
              @dragend="onDragEnd"
              @add-clicked="
                $emit(
                  'create-attribute-clicked',
                  columns[columnIndex].id,
                  rowIndex,
                )
              "
              @multiple-deleted="onMultipleDeleted"
              @cells-pasted="
                $emit('cells-pasted', {
                  cells: [...highlightedCells.values()],
                  values: $event,
                })
              "
              @pasted="
                $emit('pasted', {
                  cells: [...highlightedCells.values()],
                  value: $event,
                })
              "
              @copy-pressed="onCopyPressed"
              @edited="
                (value) =>
                  $emit('cell-edited', {
                    cell: { row: rowIndex, column: columnIndex },
                    value,
                  })
              "
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
