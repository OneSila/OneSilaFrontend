<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from 'vue-i18n'

import { TextInput } from "../../atoms/text-input"
import { Icon } from "../../atoms/icon"

defineProps<{ modelValue?: string; placeholder?: string; disabled?: boolean; }>()

const { t } = useI18n()

const input: any = ref(null)

const focus = () => {
  if (input.value) {
    input.value.focus()
  }
}

defineExpose({
  focus
})
</script>

<template>
  <label class="search-input relative block">
    <span class="absolute inset-y-0 left-0 flex items-center pl-2">
      <Icon class="text-gray-300" name="search" size="lg" />
    </span>

    <TextInput
      ref="input"
      class="search-input pl-9 w-full"
      :placeholder="placeholder || t('shared.components.molecules.searchInput.defaultPlaceholder')"
      :disabled="disabled"
      :model-value="modelValue"
      @focus="$emit('focus')"
      @update:modelValue="(event) => $emit('update:modelValue', event)"
    />
  </label>
</template>

<style scoped>
</style>
