<script setup lang="ts">
defineProps<{
  label: string;
  required?: boolean;
  hint?: string | null;
  error?: string | null;
}>();
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium text-slate-900">{{ label }}</label>
      <span v-if="required" class="text-xs font-semibold uppercase tracking-wide text-red-600">*</span>
    </div>
    <slot />
    <p v-if="hint" class="text-xs leading-5 text-slate-500">{{ hint }}</p>
    <p v-if="error" class="text-xs font-medium text-red-600">{{ error }}</p>
  </div>
</template>
