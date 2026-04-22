<script setup lang="ts">
import ImportBrokenRecordsTab from '../../components/ImportBrokenRecordsTab.vue';

defineProps<{
  importProcessId: string;
}>();
</script>

<template>
  <ImportBrokenRecordsTab :import-process-id="importProcessId" />
</template>
