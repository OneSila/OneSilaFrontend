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
  shein: sheinIcon
};


const resolveLabel = (channel: any) => {
  if (!channel) return '';
  return channel.name || cleanHostname(channel.hostname, channel.type);
};

const select = (val: string) => emit('update:modelValue', val);

</script>

<template>
  <div class="lg:border-l lg:border-gray-200">
    <div
      class="
        flex overflow-x-auto custom-scrollbar
        lg:block lg:overflow-y-auto lg:max-h-[500px] gap-2 lg:gap-0
        max-w-[200px] sm:max-w-none
      "
    >
      <!-- Default channel -->
      <div
        class="cursor-pointer flex items-center gap-2 p-2"
        :class="{ 'bg-primary text-white': modelValue === 'default' }"
        @click="select('default')"
      >
        <Icon name="store" class="w-4 h-4" />
        {{ t('shared.labels.default') }}
      </div>
      <!-- Other channels -->
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="cursor-pointer flex items-center gap-2 p-2"
        :class="{ 'bg-primary text-white': modelValue === channel.id }"
        @click="select(channel.id)"
      >
        <Icon v-if="channel.type == 'default'" :name="channel.type" class="w-4 h-4" />
        <img v-else class="w-4 h-4"
          :src="integrationTypeIcons[channel.type]"
          :alt="channel.type"
        />
        {{ resolveLabel(channel) }}
      </div>
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