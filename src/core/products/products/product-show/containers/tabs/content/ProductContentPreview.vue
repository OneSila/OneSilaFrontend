<script setup lang="ts">
import { computed } from 'vue';
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';

const props = defineProps<{
  content: any | null;
  defaultContent: any | null;
  currentChannel: string;
  channels: any[];
}>();

const cleanHostname = (hostname: string, type: string) => {
  if (!hostname) return '';
  if (type === IntegrationTypes.Amazon) {
    return hostname;
  }
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `https://${hostname}`);
    const clean = url.hostname.replace(/^www\./i, '');
    return clean.split('.')[0];
  } catch {
    return hostname;
  }
};

const finalPreview = computed(() => {
  const base = props.currentChannel !== 'default' && props.defaultContent ? props.defaultContent : {};
  return {
    name: props.content?.name || base.name || '',
    shortDescription: props.content?.shortDescription || base.shortDescription || '',
    description: props.content?.description || base.description || '',
    urlKey: props.content?.urlKey || base.urlKey || '',
  };
});

const previewUrl = computed(() => {
  let host = '';
  if (props.currentChannel === 'default') {
    host = window.location.hostname;
  } else {
    const ch = props.channels.find((c: any) => c.id === props.currentChannel);
    host = ch ? cleanHostname(ch.hostname, ch.type) : '';
  }
  return host ? `${host}/${finalPreview.value.urlKey}` : finalPreview.value.urlKey;
});
</script>

<template>
  <div class="sticky top-20 bg-gray-50 border p-4 rounded">
    <div class="h-32 w-full bg-gray-200 mb-2"></div>
    <div class="mb-2" :class="{ 'opacity-50 italic': !content?.shortDescription && defaultContent }" v-html="finalPreview.shortDescription" />
    <div class="mb-2" :class="{ 'opacity-50 italic': !content?.description && defaultContent }" v-html="finalPreview.description" />
    <div class="text-sm text-blue-600 underline break-all">{{ previewUrl }}</div>
  </div>
</template>
