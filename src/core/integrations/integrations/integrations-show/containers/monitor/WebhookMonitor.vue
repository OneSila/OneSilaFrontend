<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Toggle } from '../../../../../../shared/components/atoms/toggle';
import { Button } from '../../../../../../shared/components/atoms/button';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { Label } from '../../../../../../shared/components/atoms/label';
import { TextInput } from '../../../../../../shared/components/atoms/input-text';
import { RangeDateInput } from '../../../../../../shared/components/atoms/input-date-range';
import { Badge } from '../../../../../../shared/components/atoms/badge';
import { Title } from '../../../../../../shared/components/atoms/title';
import apolloClient from '../../../../../../../apollo-client';
import { getWebhookIntegrationQuery } from '../../../../../../shared/api/queries/webhooks.js';
import { useLiveMonitor } from './useLiveMonitor';

const { t } = useI18n();

const props = defineProps<{
  integrationId: string;
}>();

const {
  filters,
  timeRange,
  live,
  refresh,
  updateFilters,
  updateTimeRange,
} = useLiveMonitor({ filters: { integrationId: props.integrationId } });

const rpm = ref<number | null>(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getWebhookIntegrationQuery,
    variables: { id: props.integrationId },
    fetchPolicy: 'network-only',
  });
  rpm.value = data?.webhookIntegration?.requestsPerMinute || null;
});

const filterForm = ref({
  action: '',
  status: '',
  responseCode: '',
  subject: '',
});
const showFilterModal = ref(false);

const applyFilters = () => {
  const newFilters: Record<string, any> = { integrationId: props.integrationId };
  Object.entries(filterForm.value).forEach(([k, v]) => {
    if (v) {
      newFilters[k] = v;
    }
  });
  updateFilters(newFilters);
  showFilterModal.value = false;
};

const removeFilter = (key: string) => {
  const newFilters: Record<string, any> = { ...filters.value };
  delete newFilters[key];
  updateFilters(newFilters);
};

const filterChips = computed(() =>
  Object.entries(filters.value)
    .filter(([k]) => k !== 'integrationId')
    .map(([k, v]) => ({ key: k, value: v }))
);

const timeOptions = ['live', 'last15m', '1h', '6h', '24h', 'custom'] as const;
const selectedRange = ref('live');

const showCustomModal = ref(false);
const customRange = ref<any>(null);
const applyCustomRange = () => {
  if (customRange.value && customRange.value.length === 2) {
    const [from, to] = customRange.value;
    updateTimeRange({
      from: new Date(from).toISOString(),
      to: new Date(to).toISOString(),
    });
    live.value = false;
    selectedRange.value = 'custom';
    refresh();
  }
  showCustomModal.value = false;
};

const selectRange = (option: string) => {
  selectedRange.value = option;
  if (option === 'live') {
    live.value = true;
    updateTimeRange(null);
    refresh();
    return;
  }
  live.value = false;
  const to = new Date();
  let from = new Date();
  switch (option) {
    case 'last15m':
      from = new Date(to.getTime() - 15 * 60 * 1000);
      break;
    case '1h':
      from = new Date(to.getTime() - 60 * 60 * 1000);
      break;
    case '6h':
      from = new Date(to.getTime() - 6 * 60 * 60 * 1000);
      break;
    case '24h':
      from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      showCustomModal.value = true;
      return;
  }
  updateTimeRange({ from: from.toISOString(), to: to.toISOString() });
  refresh();
};

watch(live, (val) => {
  if (val) {
    selectedRange.value = 'live';
    updateTimeRange(null);
    refresh();
  }
});

const rpmDisplay = computed(() => `${rpm.value ?? 0}/120`);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Title>{{ t('webhooks.monitor.title') }}</Title>
      <div class="flex items-center gap-2">
        <Label>{{ t('webhooks.monitor.autoRefresh') }}</Label>
        <Toggle v-model="live" />
        <Badge v-if="rpm !== null" :text="`${t('webhooks.monitor.rpmCap')}: ${rpmDisplay}`" color="gray" />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button
        v-for="opt in timeOptions"
        :key="opt"
        :custom-class="`px-2 py-1 rounded text-sm ${selectedRange === opt ? 'bg-primary text-white' : 'bg-gray-100'}`"
        @click="selectRange(opt)"
      >
        {{ t(`webhooks.monitor.timeRange.${opt}`) }}
      </Button>
      <Button
        :custom-class="'px-2 py-1 rounded text-sm bg-gray-100'"
        @click="showFilterModal = true"
      >
        {{ t('webhooks.monitor.filters.title') }}
      </Button>
    </div>

    <div class="flex flex-wrap gap-2">
      <div
        v-for="chip in filterChips"
        :key="chip.key"
        class="flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm"
      >
        <span>{{ t(`webhooks.monitor.filters.${chip.key}`) }}: {{ chip.value }}</span>
        <button class="ml-1" @click="removeFilter(chip.key)">×</button>
      </div>
    </div>

    <Modal v-model="showFilterModal">
      <div class="p-4 space-y-4">
        <div>
          <Label>{{ t('webhooks.monitor.filters.action') }}</Label>
          <TextInput v-model="filterForm.action" class="w-full" />
        </div>
        <div>
          <Label>{{ t('webhooks.monitor.filters.status') }}</Label>
          <TextInput v-model="filterForm.status" class="w-full" />
        </div>
        <div>
          <Label>{{ t('webhooks.monitor.filters.responseCode') }}</Label>
          <TextInput v-model="filterForm.responseCode" class="w-full" />
        </div>
        <div>
          <Label>{{ t('webhooks.monitor.filters.subject') }}</Label>
          <TextInput v-model="filterForm.subject" class="w-full" />
        </div>
        <div class="flex justify-end">
          <Button
            @click="applyFilters"
            :custom-class="'px-4 py-2 bg-primary text-white rounded'"
          >
            {{ t('shared.actions.save') }}
          </Button>
        </div>
      </div>
    </Modal>

    <Modal v-model="showCustomModal">
      <div class="p-4 space-y-4">
        <RangeDateInput v-model="customRange" :label="t('webhooks.monitor.timeRange.custom')" />
        <div class="flex justify-end">
          <Button
            @click="applyCustomRange"
            :custom-class="'px-4 py-2 bg-primary text-white rounded'"
          >
            {{ t('shared.actions.save') }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

