<script setup lang="ts">
import { Icon } from '../../atoms/icon';
import { Button } from '../../atoms/button';

defineProps<{ disabled?: boolean }>();

defineEmits<{
  (e: 'remove-clicked', event: any): void;
}>();
</script>

<template>
</template>
