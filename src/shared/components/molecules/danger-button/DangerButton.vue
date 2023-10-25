<script setup lang="ts">
import { Button } from "../../atoms/button";
</script>

<template>
  <Button class="danger-button border-2 border-red-500 rounded-md text-red-500 py-1 hover:border-red-600 hover:text-red-600">
    <slot />
  </Button>
</template>

<style scoped>
</style>
