<template>
  <div>
    <label :for="id">{{ label }}</label>
    <div class="relative">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :id="id"
        :type="type"
        :placeholder="placeholder"
        class="form-input ps-10 placeholder:text-white-dark"
      />
      <span class="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
        <slot></slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const { id, label, type, placeholder, modelValue } = defineProps(['id', 'label', 'type', 'placeholder', 'modelValue']);
</script>
