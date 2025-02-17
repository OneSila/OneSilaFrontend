<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div v-if="loading" class="loader">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>

.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 8px solid #1F2937;
  border-top: 8px solid #4343d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
