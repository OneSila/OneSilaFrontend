<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Toggle } from '../../atoms/toggle'

defineProps<{ checked?: boolean }>()

const { t } = useI18n()
</script>

<template>
  <Toggle class="select-all-checkbox" :model-value="checked" @update:modelValue="(event) => $emit('changed', event)">
    {{ t('shared.components.molecules.selectAllCheckbox.label') }}
  </Toggle>
</template>