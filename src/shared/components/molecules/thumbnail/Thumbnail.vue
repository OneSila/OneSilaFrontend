<script setup lang="ts">
import { Image } from '../../atoms/image';
import { Icon } from '../../atoms/icon';

const props = defineProps<{
  link?: string;
  width?: string | false;
  compact?: boolean;
}>();

const getSize = () => {
  return {
    'w-full': !props.width,
    [`w-${props.width}`]: props.width,
  };
};
</script>

<template>
  <Image v-if="link" class="thumbnail" :class="getSize()" :source="link" />

  <div
    v-else
    class="thumbnail flex items-center justify-center bg-gray-200"
    :class="{
      'h-32': !compact,
      'h-24': compact,
      ...getSize(),
    }"
  >
    <Icon class="text-gray-500" name="camera" size="2x" />
  </div>
</template>

<style scoped></style>
