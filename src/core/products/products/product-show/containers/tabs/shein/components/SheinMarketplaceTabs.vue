<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { IntegrationTypes } from '../../../../../../../integrations/integrations/integrations';

const props = defineProps<{
  channels: any[];
  modelValue: string | null;
  categories: Record<
    string,
    { remoteId: string | null; id?: string | null; salesChannelId?: string | null }
  >;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const { t } = useI18n();

const select = (val: string) => emit('update:modelValue', val);

const channelEntries = computed(() =>
  props.channels.map((channel: any) => {
    const ptrId = channel?.saleschannelPtr?.id || null;
    const category =
      props.categories[channel.id] || (ptrId ? props.categories[ptrId] : null) || null;
    return {
      id: channel.id,
      channel,
      hasCategory: Boolean(category?.remoteId),
    };
  }),
);
</script>

<template>
  <div class="border-r border-gray-200 pr-4 w-full">
    <div class="max-h-[660px] overflow-y-auto space-y-2">
      <div
        v-for="entry in channelEntries"
        :key="entry.id"
        class="cursor-pointer flex items-center gap-3 p-3 border rounded-md"
        :class="[
          modelValue === entry.id ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:border-primary/60',
        ]"
        @click="select(entry.id)"
      >
        <div
          class="flex items-center justify-center w-6 h-6 rounded-full border"
          :class="entry.hasCategory ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50'"
        >
          <Icon
            :name="entry.hasCategory ? 'folder' : 'folder-open'"
            class="w-3.5 h-3.5"
            :class="entry.hasCategory ? 'text-emerald-600' : 'text-gray-400'"
          />
        </div>
        <div class="flex flex-col gap-1">
          <FlexCell>
            <span>{{ entry.channel.hostname }}</span>
          </FlexCell>
          <Link
            class="text-xs"
            :path="{
              name: 'integrations.integrations.show',
              params: { type: IntegrationTypes.Shein, id: entry.channel.id },
            }"
          >
            ({{ t('products.products.shein.openIntegration') }})
          </Link>
        </div>
      </div>
      <div v-if="!channelEntries.length" class="text-sm text-gray-500">
        {{ t('products.products.shein.noChannels') }}
      </div>
    </div>
  </div>
</template>

