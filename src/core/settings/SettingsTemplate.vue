<template>
  <div>
    <div class="mb-2">
      <slot name="breadcrumbs"></slot>
    </div>
    <div class="panel">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <slot name="tabs"></slot>
        <div class="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            <slot name="buttons"></slot>
        </div>
    </div>
      <div class="mt-2 h-full">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>