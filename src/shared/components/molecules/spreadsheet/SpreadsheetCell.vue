<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';

import { Label } from '../../atoms/label';
import { Selector } from '../../atoms/selector';
import { TextInput } from '../../atoms/text-input';
import { Link } from '../../atoms/link';
import { Icon } from '../../atoms/icon';
import { Card } from '../../atoms/card';

import { RecursiveAccordion } from '../../molecules/recursive-accordion';
import { InfoModal } from '../../molecules/info-modal';

const props = defineProps<{
  cell: any;
  column: any;
  rowId: string;
  customClasses?: Record<string, any>;
  clickable?: boolean;
  readOnly?: boolean;
  isSkuColumn?: boolean;
  dragDisabled?: boolean;
  lastHighlighted?: boolean;
  highlighted?: boolean;
  draggedOver?: boolean;
  hasHighlightedTop?: boolean;
  hasHighlightedBottom?: boolean;
  hasHighlightedRight?: boolean;
  hasHighlightedLeft?: boolean;
  hasDraggedTop?: boolean;
  hasDraggedBottom?: boolean;
  hasDraggedRight?: boolean;
  hasDraggedLeft?: boolean;
  range?: boolean;
  multipleHighlighted?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edited', value: any): void;
  (e: 'copy-pressed', value: string): void;
  (e: 'add-clicked'): void;
  (e: 'cells-pasted', value: string): void;
  (e: 'pasted', value: string): void;
  (e: 'multiple-deleted'): void;
}>();

const localValue = ref(props.cell);
const isEditing = ref(false);

const cellLabel = computed(() => {
  if (props.column.type === 'selector') {
    const option =
      props.column.options?.find(
        (option) => option[props.column.valueBy] === props.cell,
      ) || {};

    return option[props.column.labelBy] || props.cell;
  }

  if (props.column.type === 'multiselect') {
    return props.cell.map((item) => {
      const option =
        props.column.options?.find(
          (option) => option[props.column.valueBy] === item,
        ) || {};

      return option[props.column.labelBy] || item;
    });
  }

  return props.cell;
});

const cellOptions = computed(() => {
  if (Array.isArray(props.cell)) {
    return props.cell.map((item) => {
      const option =
        props.column.options?.find(
          (option) => option[props.column.valueBy] === item,
        ) || {};

      return option || { label: item };
    });
  }

  return [];
});

const classes = computed(() => {
  return {
    'border-2': props.lastHighlighted,
    'border-transparent': !props.highlighted,
    'border-blue-600': props.highlighted,
    'border-r':
      props.highlighted && !props.lastHighlighted
        ? !props.hasHighlightedRight
        : props.draggedOver
        ? !props.hasDraggedRight
        : false,
    'border-l':
      props.highlighted && !props.lastHighlighted
        ? !props.hasHighlightedLeft
        : props.draggedOver
        ? !props.hasDraggedLeft
        : false,
    'border-b':
      props.highlighted && !props.lastHighlighted
        ? !props.hasHighlightedBottom
        : props.draggedOver
        ? !props.hasDraggedBottom
        : false,
    'border-t':
      props.highlighted && !props.lastHighlighted
        ? !props.hasHighlightedTop
        : props.draggedOver
        ? !props.hasDraggedTop
        : false,
    'border-dashed border-gray-600': props.draggedOver,
    'bg-blue-100': props.highlighted && props.multipleHighlighted,
    'bg-gray-50 cursor-not-allowed': props.readOnly,
    'cursor-not-allowed': props.loading,
    'border-2 border-red-500 animate-pulse':
      props.column.errorWhenMultiple &&
      Array.isArray(localValue.value) &&
      localValue.value.length > 1,

    ...(props.customClasses || {}),
  };
});

const onEdited = () => {
  if (props.readOnly) {
    return;
  }

  emit('edited', localValue.value);

  isEditing.value = false;
};

const onKeyDown = async (event: KeyboardEvent) => {
  if (event.key === 'v' && (event.metaKey || event.ctrlKey)) {
    if (!navigator.clipboard.readText) {
      alert('Cannot access the clipboard.');
      return;
    }

    const clipboardContent = await navigator.clipboard.readText();

    try {
      const result = JSON.parse(clipboardContent);

      emit('cells-pasted', result);
    } catch {
      return emit('pasted', clipboardContent);
    }
  }

  if (event.key === 'c' && (event.metaKey || event.ctrlKey)) {
    // navigator.clipboard.writeText(JSON.stringify(localValue.value));
    emit('copy-pressed', JSON.stringify(localValue.value));
  }
};

const onDeletePressed = () => {
  if (props.readOnly) {
    return;
  }

  if (props.multipleHighlighted) {
    return emit('multiple-deleted');
  }

  const value = props.column.type === 'multiselect' ? [] : '';

  emit('edited', value);
};

watchEffect(() => {
  localValue.value = props.cell;

  if (!props.highlighted) {
    isEditing.value = false;
  }
});
</script>

<template>
  <component
    :is="clickable ? Link : 'div'"
    :path="clickable && { name: 'products.edit', params: { id: rowId } }"
    :class="classes"
    class="spreadsheet-cell outline-none relative h-full p-1"
    tabindex="0"
    block
    @dblclick="!(readOnly || loading) ? (isEditing = true) : null"
    @keydown="onKeyDown"
    @keyup.delete="onDeletePressed"
  >
    <Flex v-if="isSkuColumn" gap="1" vertical>
      <Flex v-for="option in cell" :key="option.sku" gap="1" middle>
        <span style="margin: 0; line-height: 1.2; white-space: pre">
          {{ option.sku }}
        </span>

        <InfoModal v-if="option.info">
          <template #content>
            <Card class="max-h-108 w-1/2 overflow-auto p-8">
              <RecursiveAccordion :data="option.info" />
            </Card>
          </template>
        </InfoModal>
      </Flex>
    </Flex>

    <template v-else-if="isEditing">
      <Selector
        v-if="['selector', 'multiselect'].includes(column.type)"
        v-model="localValue"
        class="w-full"
        label-by="value"
        value-by="id"
        dropdown-position="bottom"
        :options="column.options"
        :multiple="column.type === 'multiselect'"
        :limit="100"
        :more="column.options.length > 100"
        open-on-empty
        transparent
        addable
        @search:blur="onEdited"
        @add-clicked="$emit('add-clicked')"
        @deselected="onEdited"
      />

      <TextInput
        v-else
        v-model="localValue"
        class="w-full"
        transparent
        focused
        @blur="onEdited"
      />
    </template>

    <template v-else>
      <Label v-if="Array.isArray(cell)" size="sm">
        <span
          v-for="option in cellOptions"
          :key="option[column.valueBy]"
          class="vs__selected"
          :class="option.customClasses"
          style="margin: 0; line-height: 1.2; white-space: pre"
        >
          {{ option[column.labelBy] }}
        </span>
      </Label>

      <Label v-else size="sm" no-wrap>{{ cellLabel }}</Label>
    </template>

    <div
      v-if="range && lastHighlighted && !readOnly && !dragDisabled && !loading"
      class="absolute cursor-move bg-blue-600"
      style="width: 10px; height: 10px; bottom: 0px; right: 0px"
      :draggable="true"
    />

    <Icon
      v-if="loading"
      class="absolute"
      style="
        width: 18px;
        height: 18px;
        bottom: 5px;
        right: 5px;
        color: steelblue;
      "
      name="circle-notch"
      size="1x"
      spin
    />
  </component>
</template>
