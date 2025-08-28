<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLiveMonitor } from './useLiveMonitor';

const { t } = useI18n();

const props = defineProps<{
  integrationId: string;
}>();

useLiveMonitor({ filters: { integrationId: props.integrationId } });
</script>

<template>
  <div>{{ t('webhooks.monitor.title') }}</div>
</template>

