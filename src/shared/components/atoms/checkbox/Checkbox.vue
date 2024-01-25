<script setup lang="ts">
  defineProps<{ modelValue?: boolean }>();
</script>

<template>
  <label class="checkbox-container">
    <input
      type="checkbox"
      class="form-checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
  </label>
</template>

