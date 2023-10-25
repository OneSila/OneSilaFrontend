<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Checkbox from '../../atoms/checkbox/Checkbox.vue'

defineProps<{ checked?: boolean }>()

const { t } = useI18n()
</script>

<template>
  <Checkbox class="select-all-checkbox" :model-value="checked" @update:modelValue="(event) => $emit('changed', event)">
    {{ t('shared.components.molecules.selectAllCheckbox.label') }}
  </Checkbox>
</template>