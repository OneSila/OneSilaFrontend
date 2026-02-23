<script setup lang="ts">
import RemoteDocumentTypes from './containers/remote-document-types/RemoteDocumentTypes.vue';

defineProps<{ id: string; salesChannelId: string; type: string }>();
const emit = defineEmits(['pull-data']);
</script>

<template>
  <RemoteDocumentTypes
    :id="id"
    :sales-channel-id="salesChannelId"
    @pull-data="emit('pull-data')"
  />
</template>
