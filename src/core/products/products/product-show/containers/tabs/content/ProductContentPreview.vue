<script setup lang="ts">
import { computed } from 'vue';
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';

const props = defineProps<{
  content: any | null;
  defaultContent: any | null;
  currentChannel: string;
  channels: any[];
  bulletPoints?: any[];
}>();

const cleanHostname = (hostname: string, type: string) => {
  if (!hostname) return '';
  if (type === IntegrationTypes.Amazon) {
    // For Amazon, hostname might be a display name or marketplace label
    return hostname;
  }
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `https://${hostname}`);
    return url.hostname.replace(/^www\./i, '');
  } catch {
    return hostname;
  }
};

const channelInfo = computed(() => {
  if (props.currentChannel === 'default') {
    return { type: 'default', label: window.location.hostname };
  }
  const ch = props.channels.find((c: any) => c.id === props.currentChannel);
  if (!ch) return { type: '', label: '' };
  if (ch.type === IntegrationTypes.Amazon) {
    // Use the channel name (marketplace, e.g., "Amazon UK")
    return { type: ch.type, label: ch.hostname };
  }
  return { type: ch.type, label: cleanHostname(ch.hostname, ch.type) };
});

function isEmptyContent(value: string | undefined | null): boolean {
  if (!value) return true;

  const normalized = value.replace(/\s/g, '').toLowerCase();
  return normalized === '<p><br></p>' || normalized === '<br>' || normalized === '<p></p>';
}


const finalPreview = computed(() => {
  const base = props.currentChannel !== 'default' && props.defaultContent ? props.defaultContent : {};
  return {
    name: props.content?.name || base.name || '',
    shortDescription:
      !isEmptyContent(props.content?.shortDescription)
        ? props.content?.shortDescription
        : (base.shortDescription || ''),
    description:
      !isEmptyContent(props.content?.description)
        ? props.content?.description
        : (base.description || ''),
    urlKey: props.content?.urlKey || base.urlKey || '',
    bulletPoints: props.bulletPoints || [],
  };
});


const previewUrl = computed(() => {
  if (!channelInfo.value.label) return finalPreview.value.urlKey;
  return `${channelInfo.value.label}/${finalPreview.value.urlKey}`;
});
</script>


<template>
  <div class="sticky top-20 rounded shadow bg-white border p-0 max-w-2xl mx-auto max-h-[520px] overflow-y-auto custom-scrollbar">
    <!-- Fake Browser Bar -->
    <div class="flex items-center bg-gray-100 border-b border-gray-200 px-5 py-2 rounded-t">
      <div class="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
      <div class="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
      <div class="w-3 h-3 rounded-full bg-green-400 mr-4"></div>
      <div class="text-sm text-gray-500 truncate font-mono">
        {{ previewUrl }}
      </div>
    </div>
    <!-- Name -->
    <div class="px-5 pt-4 pb-1 text-lg font-semibold truncate">{{ finalPreview.name }}</div>
    <!-- Upper section: image (1/3) and short description (2/3) -->
    <div class="flex px-5 pt-4 pb-1 gap-4">
      <div class="w-1/3 flex-shrink-0">
        <div class="h-24 w-full bg-gray-200 rounded shadow-inner flex items-center justify-center">
          <span class="text-gray-400 text-xs">Image</span>
        </div>
      </div>
      <div class="w-2/3">
        <div
          class="min-h-16 text-gray-700"
          :class="{ 'opacity-50 italic': !props.content?.shortDescription && props.defaultContent }"
          v-html="finalPreview.shortDescription"
        />
      </div>
    </div>
    <!-- Description below -->
    <div class="px-5 pt-2 pb-4">
      <div
        class="text-gray-700  prose prose-sm"
        :class="{ 'opacity-50 italic': !props.content?.description && props.defaultContent }"
        v-html="finalPreview.description"
      />
      <ul v-if="finalPreview.bulletPoints.length" class="list-disc pl-6 mt-2 text-gray-700">
        <li v-for="bp in finalPreview.bulletPoints" :key="bp.id || bp.text">{{ bp.text }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #c0c0c0;
}

</style>