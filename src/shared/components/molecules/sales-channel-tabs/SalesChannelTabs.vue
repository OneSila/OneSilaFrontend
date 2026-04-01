<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { IntegrationTypes } from '../../../../core/integrations/integrations/integrations';
import { Icon } from '../../atoms/icon';
import magentoIcon from '../../../../assets/images/integration-types/icons/magento.svg';
import shopifyIcon from '../../../../assets/images/integration-types/icons/shopify.svg';
import woocommerceIcon from '../../../../assets/images/integration-types/icons/woocommerce.svg';
import amazonIcon from '../../../../assets/images/integration-types/icons/amazon.svg';
import ebayIcon from '../../../../assets/images/integration-types/icons/ebay.svg';
import sheinIcon from '../../../../assets/images/integration-types/icons/shein.svg';
import miraklIcon from '../../../../assets/images/integration-types/icons/mirakl.svg';
import noImageIcon from '../../../../assets/images/integration-types/icons/no_image.svg';

const props = defineProps<{ channels: any[]; modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();
const { t } = useI18n();

const cleanHostname = (hostname: string, type: string) => {
  if (!hostname) return '';
  if (type === IntegrationTypes.Amazon || type === IntegrationTypes.Ebay || type === IntegrationTypes.Shein) {
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

const integrationTypeIcons: Record<string, string> = {
  magento: magentoIcon,
  shopify: shopifyIcon,
  woocommerce: woocommerceIcon,
  amazon: amazonIcon,
  ebay: ebayIcon,
  shein: sheinIcon,
  mirakl: miraklIcon,
};

const resolveIcon = (channel: any) => {
  if (!channel) return '';
  return channel.iconSvgUrl || integrationTypeIcons[channel.type] || noImageIcon;
};

const resolveLabel = (channel: any) => {
  if (!channel) return '';
  return channel.name || cleanHostname(channel.hostname, channel.type);
};

const select = (val: string) => emit('update:modelValue', val);

</script>

<template>
  <div class="w-full min-w-0">
    <div
      class="flex max-h-[280px] min-w-0 flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar md:max-h-[340px] lg:max-h-[620px]"
    >
      <button
        type="button"
        class="group flex w-full min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition"
        :class="modelValue === 'default'
          ? 'border-primary bg-primary text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'"
        @click="select('default')"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          :class="modelValue === 'default' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'"
        >
          <Icon name="store" class="h-4.5 w-4.5" />
        </span>
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold">
            {{ t('shared.labels.default') }}
          </span>
        </span>
      </button>

      <button
        v-for="channel in channels"
        :key="channel.id"
        type="button"
        class="group flex w-full min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition"
        :class="modelValue === channel.id
          ? 'border-primary bg-primary text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'"
        @click="select(channel.id)"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          :class="modelValue === channel.id ? 'bg-white/15' : 'bg-slate-100'"
        >
          <Icon
            v-if="channel.type == 'default'"
            :name="channel.type"
            class="h-4.5 w-4.5"
            :class="modelValue === channel.id ? 'text-white' : 'text-slate-500'"
          />
          <img
            v-else
            class="h-4.5 w-4.5 object-contain"
            :src="resolveIcon(channel)"
            :alt="channel.type"
          />
        </span>
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold">
            {{ resolveLabel(channel) }}
          </span>
          <span
            class="block truncate text-xs"
            :class="modelValue === channel.id ? 'text-white/75' : 'text-slate-400'"
          >
            {{ channel.type }}
          </span>
        </span>
      </button>
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
