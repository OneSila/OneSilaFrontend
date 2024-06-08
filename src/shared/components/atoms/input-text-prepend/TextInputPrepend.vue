<script setup lang="ts">

import { Label } from '../label'

const { id, label, type, placeholder, modelValue } = defineProps(['id', 'label', 'type', 'placeholder', 'modelValue']);
</script>

<template>
  <div>
    <Label v-if="label" :for="id" class="font-semibold text-md">{{ label }}</Label>
    <div class="relative mt-2">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :id="id"
        :type="type"
        :placeholder="placeholder"
        class="form-input ps-10"
      />
      <span class="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
        <slot></slot>
      </span>
    </div>
  </div>
</template>
