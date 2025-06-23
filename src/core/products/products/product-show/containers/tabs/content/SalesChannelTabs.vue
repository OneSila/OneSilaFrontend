<script setup lang="ts">
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ channels: any[]; modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();
const { t } = useI18n();

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

const select = (val: string) => emit('update:modelValue', val);
</script>

<template>
  <div>
    <div class="overflow-y-auto max-h-[500px]">
      <div
        class="cursor-pointer flex items-center gap-2 p-2"
        :class="{ 'bg-primary text-white': modelValue === 'default' }"
        @click="select('default')"
      >
        <Icon name="store" class="w-4 h-4" />
        Default
      </div>
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="cursor-pointer flex items-center gap-2 p-2"
        :class="{ 'bg-primary text-white': modelValue === channel.id }"
        @click="select(channel.id)"
      >
        <Icon :name="channel.type" class="w-4 h-4" />
        {{ cleanHostname(channel.hostname, channel.type) }}
      </div>
    </div>
    <div v-if="modelValue !== 'default'" class="text-xs text-gray-500 mt-2">
      {{ t('products.translation.warning.inheritFromDefault') }}
    </div>
  </div>
</template>
