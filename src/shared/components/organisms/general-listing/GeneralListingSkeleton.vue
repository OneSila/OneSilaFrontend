<template>
  <div class="p-4 animate-pulse space-y-3">
    <div class="h-6 bg-gray-200 rounded w-1/3"></div>
    <div class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
</template>

