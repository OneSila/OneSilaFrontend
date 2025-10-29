<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { IntegrationTypes } from '../../../../../../../integrations/integrations/integrations';

const props = defineProps<{
  views: any[];
  modelValue: string | null;
  categories: Record<string, { remoteId: string | null }>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const { t } = useI18n();

const select = (val: string) => emit('update:modelValue', val);

const viewEntries = computed(() =>
  props.views.map((view: any) => ({
    id: view.id,
    view,
    hasCategory: Boolean(props.categories[view.id]?.remoteId),
  })),
);
</script>

<template>
  <div class="border-r border-gray-200 pr-4">
    <div class="max-h-[660px] overflow-y-auto space-y-2">
      <div
        v-for="entry in viewEntries"
        :key="entry.id"
        class="cursor-pointer flex items-center gap-3 p-3 border rounded-md"
        :class="{ 'bg-primary text-white': modelValue === entry.id }"
        @click="select(entry.id)"
      >
        <Icon
          :name="entry.hasCategory ? 'circle-check' : 'circle-xmark'"
          class="w-4 h-4"
          :class="entry.hasCategory ? 'text-green-500' : 'text-red-500'"
        />
        <div class="flex flex-col gap-1">
          <FlexCell>
            <Flex gap="2">
              <FlexCell>
                <span>{{ entry.view.name || entry.view.remoteId }}</span>
              </FlexCell>
              <FlexCell>
                <Icon
                  v-if="entry.view.isDefault"
                  name="crown"
                  class="w-4 h-4 text-yellow-400"
                  :title="t('products.products.ebay.defaultMarketplace')"
                />
              </FlexCell>
            </Flex>
          </FlexCell>
          <Link
            class="text-xs"
            :path="{
              name: 'integrations.integrations.show',
              params: { type: IntegrationTypes.Ebay, id: entry.view.salesChannel.id },
            }"
          >
            ({{ entry.view.salesChannel.hostname }})
          </Link>
        </div>
      </div>
      <div v-if="!viewEntries.length" class="text-sm text-gray-500">
        {{ t('products.products.ebay.noViews') }}
      </div>
    </div>
  </div>
</template>
