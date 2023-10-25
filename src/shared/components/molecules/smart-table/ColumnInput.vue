<script setup lang="ts">
import { ref } from 'vue';

import { TextInput } from '../../atoms/text-input';
import { Switch } from '../../atoms/switch';

import { MediaItemPickerThumbnail } from '../../../../core/media/media-library/containers/media-item-picker-thumbnail';

import { ColumnType } from './ColumnType';

const props = defineProps<{
  value: any;
  type: ColumnType;
  disabled?: boolean;
}>();

const rawValue = ref(props.value);
</script>

<template>
  <div class="smart-table__column-input">
    <TextInput
      v-if="type === ColumnType.TEXT"
      v-model="rawValue"
      :disabled="disabled"
      transparent
      @blur="$emit('update', rawValue)"
    />

    <Switch
      v-if="type === ColumnType.SWITCH"
      v-model="rawValue"
      class="px-2"
      :disabled="disabled"
      @update:model-value="$emit('update', rawValue)"
    />

    <MediaItemPickerThumbnail
      v-if="type === ColumnType.IMAGE"
      :image="rawValue"
      :disabled="disabled"
      @click="(image) => $emit('image-click', image)"
      @removed="$emit('update', null)"
    />
  </div>
</template>
