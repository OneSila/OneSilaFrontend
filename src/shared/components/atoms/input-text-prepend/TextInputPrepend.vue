<script setup lang="ts">
import { defineProps } from 'vue';
import { Label } from '../label'

const { id, label, type, placeholder, modelValue } = defineProps(['id', 'label', 'type', 'placeholder', 'modelValue']);
</script>

<template>
  <div>
    <Label :for="id" class="mb-2">{{ label }}</Label>
    <div class="relative">
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
