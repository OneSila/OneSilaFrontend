<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Badge } from '../../../../../../../shared/components/atoms/badge';

const { t } = useI18n();

interface Props {
  events: any[];
  loading: boolean;
  optionLabelMap: Record<string, Record<string, string>>;
  statusBadgeMap: Record<string, { text: string; color: string }>;
  openDrawer: (ev: any) => void;
  formatTime: (iso: string) => string;
  getResponseCodeColor: (code?: number | null) => string;
}

defineProps<Props>();
</script>

<template>
  <div class="mt-4">
    <div class="grid grid-cols-8 bg-gray-50 border-b border-gray-300">
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.time') }}
      </div>
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.topic') }}
      </div>
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.action') }}
      </div>
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.subjectId') }}
      </div>
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.status') }}
      </div>
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.httpCode') }}
      </div>
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.latency') }}
      </div>
      <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
        {{ t('webhooks.monitor.table.attempt') }}
      </div>
    </div>
    <div>
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="grid grid-cols-8 border-b border-gray-200 bg-white">
          <div v-for="i in 8" :key="i" class="px-3 py-2">
            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <transition-group v-else name="list" tag="div">
        <div
          v-for="ev in events"
          :key="ev.outbox.id"
          class="grid grid-cols-8 border-b border-gray-200 bg-white cursor-pointer"
          @click="openDrawer(ev)"
        >
          <div class="px-3 py-2 text-sm text-gray-500">
            {{ formatTime(ev.sentAt) }}
          </div>
          <div class="px-3 py-2 text-sm text-gray-500">
            {{ optionLabelMap.topic[ev.outbox.topic] || ev.outbox.topic }}
          </div>
          <div class="px-3 py-2 text-sm text-gray-500">
            {{ optionLabelMap.action[ev.outbox.action] }}
          </div>
          <div class="px-3 py-2 text-sm text-gray-500">
            {{ ev.outbox.subjectId }}
          </div>
          <div class="px-3 py-2 text-sm text-gray-500">
            <Badge :color="statusBadgeMap[ev.status].color" :text="statusBadgeMap[ev.status].text" />
          </div>
          <div class="px-3 py-2 text-sm text-gray-500">
            <Badge :color="getResponseCodeColor(ev.responseCode)" :text="ev.responseCode" />
          </div>
          <div class="px-3 py-2 text-sm text-gray-500">
            {{ ev.responseMs }}
          </div>
          <div class="px-3 py-2 text-sm text-gray-500">
            {{ ev.attempt }}
          </div>
        </div>
      </transition-group>
      <div v-if="!loading && events.length === 0" class="text-center py-4 text-sm text-gray-500">
        {{ t('webhooks.monitor.empty') }}
      </div>
    </div>
  </div>
</template>
