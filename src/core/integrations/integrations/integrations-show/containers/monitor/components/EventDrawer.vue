<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Title } from '../../../../../../../shared/components/atoms/title';

const { t } = useI18n();

interface HeaderKV {
  key: string;
  value: string;
}

interface Props {
  event: any | null;
  activeTab: string;
  drawerTabs: readonly string[];
  integrationHeaders: HeaderKV[];
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'update:activeTab', 'replay', 'copyCurl']);
</script>

<template>
  <transition name="fade">
    <div v-if="event" class="fixed inset-0 z-50 flex">
      <div class="flex-1 bg-black/50" @click="emit('close')"></div>
      <div class="w-96 bg-white h-full overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-4">
          <Title>{{ t('webhooks.monitor.title') }}</Title>
          <button @click="emit('close')">×</button>
        </div>
        <div class="flex items-center gap-2 mb-4">
          <Button
            v-for="tab in drawerTabs"
            :key="tab"
            :custom-class="`px-2 py-1 rounded text-sm ${props.activeTab === tab ? 'bg-primary text-white' : 'bg-gray-100'}`"
            @click="emit('update:activeTab', tab)"
          >
            {{ t(`webhooks.monitor.drawer.tabs.${tab}`) }}
          </Button>
        </div>

        <div v-if="props.activeTab === 'overview'" class="space-y-2 text-sm">
          <div><strong>{{ t('webhooks.monitor.drawer.overview.status') }}:</strong> {{ event.status }}</div>
          <div><strong>{{ t('webhooks.monitor.drawer.overview.attemptCount') }}:</strong> {{ event.attempt }}</div>
          <div v-if="event.errorMessage"><strong>{{ t('webhooks.monitor.drawer.overview.lastError') }}:</strong> {{ event.errorMessage }}</div>
          <div><strong>{{ t('webhooks.monitor.drawer.overview.idempotencyKey') }}:</strong> {{ event.outbox.id }}</div>
        </div>

        <div v-else-if="props.activeTab === 'attempts'" class="space-y-2 text-sm">
          <div v-for="att in event.attempts" :key="att.number" class="border-b pb-2">
            <div><strong>{{ t('webhooks.monitor.drawer.attempts.number') }}:</strong> {{ att.number }}</div>
            <div><strong>{{ t('webhooks.monitor.drawer.attempts.responseCode') }}:</strong> {{ att.responseCode }}</div>
            <div><strong>{{ t('webhooks.monitor.drawer.attempts.latency') }}:</strong> {{ att.responseMs }}</div>
            <div v-if="att.errorText"><strong>{{ t('webhooks.monitor.drawer.attempts.error') }}:</strong> {{ att.errorText }}</div>
          </div>
        </div>

        <div v-else-if="props.activeTab === 'payload'" class="text-sm">
          <pre class="bg-gray-100 p-2 rounded overflow-auto">{{ JSON.stringify(event.outbox.payload, null, 2) }}</pre>
        </div>

        <div v-else-if="props.activeTab === 'headers'" class="space-y-2 text-sm">
          <div v-for="h in integrationHeaders" :key="h.key">
            <strong>{{ h.key }}</strong>: {{ h.value }}
          </div>
        </div>

        <div v-else-if="props.activeTab === 'replay'" class="flex flex-col gap-2 text-sm">
          <Button :custom-class="'bg-primary text-white px-2 py-1 rounded'" @click="emit('replay')">
            {{ t('webhooks.monitor.drawer.replay.replayButton') }}
          </Button>
          <Button :custom-class="'bg-gray-100 px-2 py-1 rounded'" @click="emit('copyCurl')">
            {{ t('webhooks.monitor.drawer.replay.copyCurlButton') }}
          </Button>
        </div>
      </div>
    </div>
  </transition>
</template>
