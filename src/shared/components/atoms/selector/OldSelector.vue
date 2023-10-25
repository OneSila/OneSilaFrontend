<script setup lang="ts">
import VueSelect from 'vue-next-select'
import 'vue-next-select/dist/index.min.css'

defineProps<{ options?: any[]; modelValue?: any; }>()
</script>

<template>
  <VueSelect
    class="selector py-1 shadow-sm border border-gray-300 rounded-md"
    placeholder="Selecteer"
    :model-value="modelValue"
    :options="options || []"
    @update:modelValue="event => $emit('update:modelValue', event)"
    @search:input="event => $emit('searched', event.target.value)"
    @selected="event => $emit('selected', event)"
    close-on-select
    searchable
  ></VueSelect>
</template>
