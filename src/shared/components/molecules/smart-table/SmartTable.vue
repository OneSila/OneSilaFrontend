<script setup lang="ts">
import { ref } from 'vue';

import { DataTable } from '../../atoms/data-table';
import { Label } from '../../atoms/label';

import { MediaItemPickerModal } from '../../../../core/media/media-library/containers/media-item-picker-modal';

import { ColumnType } from './ColumnType';
import ColumnInput from './ColumnInput.vue';

type SmartTableColumn = {
  label: string;
  type: ColumnType;
  readOnly?: boolean;
};

const props = defineProps<{
  columns: (string | SmartTableColumn)[];
  rows: any[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (
    e: 'column-updated',
    newValue: any,
    rowIndex: number,
    columnIndex: number,
  ): void;
}>();

const modal = ref();

const getColumns = () => {
  return props.columns.map((column) => {
    if (typeof column === 'string') {
      return column;
    }

    return (column as SmartTableColumn).label;
  });
};

const getColumnType = (columnIndex: number): ColumnType => {
  return typeof props.columns[columnIndex] !== 'string'
    ? (props.columns[columnIndex] as SmartTableColumn).type || ColumnType.TEXT
    : ColumnType.TEXT;
};

const isColumnReadOnly = (columnIndex: number): boolean => {
  if (typeof props.columns[columnIndex] !== 'string') {
    return !!(props.columns[columnIndex] as SmartTableColumn).readOnly;
  }

  return false;
};

const onImageClicked = (rowIndex: number, columnIndex: number) => {
  modal.value?.open(rowIndex, columnIndex);
};

const onImageAdded = ({ image, rowIndex, columnIndex }) => {
  emit('column-updated', image, rowIndex, columnIndex);
};
</script>

<template>
  <DataTable class="smart-table" :columns="getColumns()" :rows="rows">
    <template #column="{ rowIndex, column, columnIndex }">
      <Label v-if="isColumnReadOnly(columnIndex)" class="px-3" no-wrap>{{
        column
      }}</Label>

      <ColumnInput
        v-else
        :value="column"
        :type="getColumnType(columnIndex)"
        :disabled="disabled"
        @image-click="onImageClicked(rowIndex, columnIndex)"
        @update="
          (event) => emit('column-updated', event, rowIndex, columnIndex)
        "
      />
    </template>
  </DataTable>

  <MediaItemPickerModal ref="modal" @added="onImageAdded" />
</template>
