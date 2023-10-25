<script setup lang="ts">
import { ref, watchEffect, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AliveQuery from '../../../api/queries/AliveQuery.vue';

import { injectNetwork } from '../../../modules/network';

import { Card } from '../../atoms/card';
import { Icon } from '../../atoms/icon';
import { Label } from '../../atoms/label';
import { Modal } from '../../atoms/modal';

import { DangerButton } from '../danger-button';
import { SecondaryButton } from '../secondary-button';

const { t } = useI18n();
const network = injectNetwork();

const showModal = ref(false);
const retrying = ref(false);
const canForceRetry = ref(true);
const lastRetriedAt = ref(0);
const requestDelay = ref(500);
const aliveQuery: Ref<any> = ref(null);
const nextRetryAt = ref(0);
const timeUntilNextRetry = ref(0);

let alivenessTimer: any = null;
let retryCountdownInterval: any = null;
const MAX_REQUEST_DELAY = 5 * 60 * 1000;

const onRefreshClicked = () => window.location.reload();

const scheduleAlivenessCheck = async () => {
  requestDelay.value *= 2;

  if (requestDelay.value > MAX_REQUEST_DELAY) {
    requestDelay.value = MAX_REQUEST_DELAY;
  }

  clearTimeout(alivenessTimer);
  clearInterval(retryCountdownInterval);

  alivenessTimer = setTimeout(() => {
    retryConnection();
  }, requestDelay.value);

  nextRetryAt.value = Date.now() + requestDelay.value;

  retryCountdownInterval = setInterval(() => {
    if (nextRetryAt.value) {
      timeUntilNextRetry.value = nextRetryAt.value - Date.now();
      canForceRetry.value = Date.now() - lastRetriedAt.value > 5000;
    }
  }, 1000);
};

scheduleAlivenessCheck();

const retryConnection = async () => {
  clearTimeout(alivenessTimer);
  clearInterval(retryCountdownInterval);

  retrying.value = true;
  lastRetriedAt.value = Date.now();
  canForceRetry.value = false;

  try {
    const data = await aliveQuery.value?.run();

    if (data.value) {
      network.connected = true;
      requestDelay.value = 500;
    }
  } catch {
    scheduleAlivenessCheck();
  }

  retrying.value = false;
  nextRetryAt.value = 0;
  timeUntilNextRetry.value = 0;
};

window.addEventListener('online', () => {
  scheduleAlivenessCheck();
});

window.addEventListener('offline', () => {
  network.connected = false;
});

watchEffect(() => {
  showModal.value = !network.connected;
});

watchEffect(() => {
  if (!network.connected) {
    scheduleAlivenessCheck();
  }
});
</script>

<template>
  <Modal
    v-model="showModal"
    :options="{ closeClickDimmed: false, closeKeyCode: false }"
  >
    <Card>
      <Flex gap="4" class="text-red-500" center vertical>
        <FlexCell>
          <Icon name="exclamation-triangle" size="8x" />
        </FlexCell>

        <FlexCell>
          <Label size="lg">{{ t('network.error') }}</Label>
        </FlexCell>

        <FlexCell class="text-gray-500">
          <Label v-if="!retrying && timeUntilNextRetry" size="lg">{{
            t('network.retryingIn', {
              num: Math.round(timeUntilNextRetry / 1000),
            })
          }}</Label>

          <Label v-else size="lg">{{ t('network.retrying') }}</Label>
        </FlexCell>

        <FlexCell>
          <Flex gap="2">
            <FlexCell>
              <DangerButton class="bg-white px-3" @click="onRefreshClicked()">{{
                t('network.refresh')
              }}</DangerButton>
            </FlexCell>

            <FlexCell v-if="!retrying && canForceRetry">
              <SecondaryButton
                class="bg-white px-3"
                @click="retryConnection()"
                >{{ t('network.retryConnect') }}</SecondaryButton
              >
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </Card>
  </Modal>

  <AliveQuery ref="aliveQuery" manual />
</template>
