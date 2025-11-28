<script setup lang="ts">
import { toRefs } from 'vue';
import RemoteProductTypes from '../remote-product-types/RemoteProductTypes.vue';
import { IntegrationTypes } from '../../../../../integrations';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);

const { id, salesChannelId } = toRefs(props);
</script>

<template>
  <RemoteProductTypes
    :id="id"
    :sales-channel-id="salesChannelId"
    :type="IntegrationTypes.Shein"
    @pull-data="emit('pull-data')"
  />
</template>
