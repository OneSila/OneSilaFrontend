<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { IntegrationTypes } from '../../../../../../../integrations/integrations/integrations';

const props = defineProps<{ views: any[]; amazonProducts: any[]; modelValue: string | null }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const select = (val: string) => emit('update:modelValue', val);

const hasMarketplace = (view: any) =>
  props.amazonProducts.some((p: any) => p.createdMarketplaces.includes(view.remoteId));

const groupedViews = computed(() => {
  const groups: Record<string, any[]> = {};
  props.views.forEach((view: any) => {
    const scId = view.salesChannel?.id || 'unknown';
    if (!groups[scId]) groups[scId] = [];
    groups[scId].push(view);
  });
  return Object.entries(groups).map(([salesChannelId, views]) => ({ salesChannelId, views }));
});
</script>

<template>
  <div class="border-r border-gray-200 pr-4">
    <div class="max-h-[500px] overflow-y-auto">
      <div v-for="group in groupedViews" :key="group.salesChannelId" class="mb-4 space-y-4">
        <div
          v-for="view in group.views"
          :key="view.id"
          class="cursor-pointer flex items-center gap-3 p-3 border rounded-md"
          :class="{ 'bg-primary text-white': modelValue === view.id }"
          @click="select(view.id)"
        >
          <Icon
            :name="hasMarketplace(view) ? 'circle-check' : 'circle-xmark'"
            class="w-4 h-4"
            :class="hasMarketplace(view) ? 'text-green-500' : 'text-red-500'"
          />
          <div class="flex flex-col gap-1">
            <span>{{ view.name || view.remoteId }}</span>
            <Link
              class="text-xs"
              :path="{
                name: 'integrations.integrations.show',
                params: { type: IntegrationTypes.Amazon, id: view.salesChannel.id },
              }"
            >
              ({{ view.salesChannel.hostname }})
            </Link>
          </div>
        </div>
        <div class="h-px bg-gray-200"></div>
      </div>
    </div>
  </div>
</template>

