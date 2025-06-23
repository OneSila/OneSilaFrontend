<script setup lang="ts">
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { useI18n } from 'vue-i18n';
import magentoIcon from "../../../../../../../assets/images/integration-types/icons/magento.svg";
import shopifyIcon from "../../../../../../../assets/images/integration-types/icons/shopify.svg";
import woocommerceIcon from "../../../../../../../assets/images/integration-types/icons/woocommerce.svg";
import amazonIcon from "../../../../../../../assets/images/integration-types/icons//amazon.svg";

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

const integrationTypeIcons = {
  magento: magentoIcon,
  shopify: shopifyIcon,
  woocommerce: woocommerceIcon,
  amazon: amazonIcon,
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
        {{ t('shared.labels.default') }}
      </div>
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
        {{ cleanHostname(channel.hostname, channel.type) }}
      </div>
    </div>
    <div v-if="modelValue !== 'default'" class="text-xs text-orange-700 mt-2">
      {{ t('products.translation.warning.inheritFromDefault') }}
    </div>
  </div>
</template>
